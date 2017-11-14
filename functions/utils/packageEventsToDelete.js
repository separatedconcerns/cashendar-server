

const packageEventsToDelete = (auth, calendarId, eventsToDeleteQueue) => {
  const packagedEventsToDelete = [];

  eventsToDeleteQueue.forEach((eventId) => {
    const event = {
      auth,
      calendarId,
      eventId,
    };
    packagedEventsToDelete.push(event);
  });

  return packagedEventsToDelete;
};

module.exports = packageEventsToDelete;
