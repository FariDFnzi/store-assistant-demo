function purgeDeletedConversations(conversations, ids) {
  const selected = new Set(ids);
  const removedIds = [];
  const remaining = conversations.filter(thread => {
    if (thread.deletedAt && selected.has(thread.id)) {
      removedIds.push(thread.id);
      return false;
    }
    return true;
  });
  return { remaining, removedIds };
}
