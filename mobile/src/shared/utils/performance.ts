import { edit, add, remove } from '/home/user1/KPTESTPRO/mobile/src/store';

// Stats API integration
edit('store', (content) => {
  // Add statsApi import
  if (!content.includes("import { statsApi } from '../features/stats/api/statsApi'")) {
    content = content.replace(
      "import { notificationApi } from '../features/notifications/api/notificationApi';",
      "import { notificationApi } from '../features/notifications/api/notificationApi';\nimport { statsApi } from '../features/stats/api/statsApi';"
    );
  }

  // Add statsApi to reducer
  if (!content.includes('[statsApi.reducerPath]')) {
    content = content.replace(
      '[notificationApi.reducerPath]: notificationApi.reducer,',
      '[notificationApi.reducerPath]: notificationApi.reducer,\n  [statsApi.reducerPath]: statsApi.reducer,'
    );
  }

  // Add statsApi middleware
  if (!content.includes('statsApi.middleware')) {
    content = content.replace(
      'notificationApi.middleware,',
      'notificationApi.middleware,\n      statsApi.middleware,'
    );
  }

  return content;
});
