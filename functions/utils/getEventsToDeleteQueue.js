

const getEventsToDeleteQueue = (datesToScheduleQueue, scheduledEvents) => {
  const eventsToDeleteQueue = [];

  datesToScheduleQueue.forEach((date) => {
    if (scheduledEvents[date]) {
      eventsToDeleteQueue.push(scheduledEvents[date]);
    }
  });

  return eventsToDeleteQueue;
};

module.exports = getEventsToDeleteQueue;
