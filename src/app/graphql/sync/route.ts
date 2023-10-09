// Use addSync to add operations and sync to process them all in block/tx order
import { NextRequest, NextResponse } from "next/server";

// Import the sync command and db drivers to setup engine
import { DB, Mongo, Stage, SyncConfig, setEngine, sync } from "supagraph";

// Import mongodb client
import { getMongodb } from "@providers/mongoClient";

// Import all mappings to be registered
import { handlers } from "@supagraph/handlers";

// Import revalidation timings from config
import { config } from "@supagraph/config";

import { startups } from "../../../supagraph/startup";

// forces the route handler to be dynamic
export const dynamic = "force-dynamic";

// construct the sync call
const syncLogic = async () => {
  // Switch out the engine for development to avoid the mongo requirment locally
  await setEngine({
    // name the connection
    name: config.name,
    // db is dependent on state
    db:
      // in production/production like environments we want to store mutations to mongo otherwise we can store them locally
      !process.env.MONGODB_URI ||
      (process.env.NODE_ENV === "development" && config.dev)
        ? // connect store to in-memory/node-persist store
          DB.create({
            kv: {},
            name: config.name,
            reset: (config as unknown as SyncConfig)?.reset,
          })
        : // connect store to MongoDB
          Mongo.create({
            kv: {},
            name: config.name,
            mutable: config.mutable,
            client: getMongodb(process.env.MONGODB_URI!),
          }),
  });

  // await each of the startup operations
  for (const startup of startups) {
    await startup();
  }

  // all new events discovered from all sync operations detailed in a summary
  const summary = await sync({
    // insert config and handlers via sync (this will be merged with in memory syncs)
    config,
    handlers,
    // TODO: add migrations here
    // // setup the imported migrations
    // migrations: await migrations(),
    // construct error handler to exit the process on error
    onError: async (e, close) => {
      // log end of stream
      console.error("\n\n[LISTENER ERROR]: Listener has thrown - restart");
      // log the error that ended it
      console.error(e);
      // close the stream
      await close();
      // exit after we've finished here
      process.exit(1);
    },
  });

  // if an error is thrown (db locked) we can signal a halt to restart the server
  if (summary.error) throw summary.error;

  // print initial summary (this was the catchup sync - ongoing listen action will happen after this return)
  console.log(summary);

  return summary;
};

// Expose the sync command on a route so that we can call it with a cron job
export async function GET(request: NextRequest) {
  // set the start stage of the sync ("events", "blocks", "transactions", "sort", "process")
  const start =
    (request.nextUrl.searchParams.get("start") as keyof typeof Stage) || false;
  // set the stop stage of the sync ("events", "blocks", "transactions", "sort", "process")
  const stop =
    (request.nextUrl.searchParams.get("stop") as keyof typeof Stage) || false;

  // all new events discovered from all sync operations detailed in a summary
  const summary = await syncLogic();

  // we don't need to sync more often than once per block - and if we're using vercel.json crons we can only sync 1/min
  return NextResponse.json(summary, {
    headers: {
      // allow to be cached for revalidate seconds and allow caching in shared public cache (upto revalidate seconds)
      "Cache-Control": `max-age=${config.revalidate}, public, s-maxage=${config.revalidate}`,
    },
  });
}
