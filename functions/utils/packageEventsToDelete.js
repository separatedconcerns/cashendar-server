

const packageEventsToDelete = (auth, calendarId, eventsToDelete) => {
  const packagedEventsToDelete = [];

  eventsToDelete.forEach((eventId) => {
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
