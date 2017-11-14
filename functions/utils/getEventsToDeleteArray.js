

const getEventsToDeleteArray = (datesToScheduleQueue, scheduledEvents) => {
  const eventsToDelete = [];

  datesToScheduleQueue.forEach((date) => {
    if (scheduledEvents[date]) {
      eventsToDelete.push(scheduledEvents[date]);
    }
  });

  return eventsToDelete;
};

module.exports = getEventsToDeleteArray;
