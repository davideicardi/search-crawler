"use strict";

var CronJob = require('cron').CronJob;


// cron examples:

// "00 30 11 * * 1-5"
// Runs every weekday (Monday through Friday) at 11:30:00 AM.
// It does not run on Saturday or Sunday.

// "* * * * * *"
// Runs every seconds

// "0 * * * * *"
// Runs every minutes

// start/stop jobs using cronJob.start()/stop/()

function createJob(cronExpression, jobFunction){
  return new CronJob(cronExpression, jobFunction);
}


exports.createJob = createJob;
