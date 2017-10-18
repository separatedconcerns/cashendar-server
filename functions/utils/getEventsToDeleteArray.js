

const getEventsToDeleteArray = (datesToSchedule, scheduledEvents) => {
  const eventsToDelete = [];

  datesToSchedule.forEach((date) => {
    if (scheduledEvents[date]) {
      eventsToDelete.push(scheduledEvents[date]);
    }
  });

  return eventsToDelete;
};

module.exports = getEventsToDeleteArray;
