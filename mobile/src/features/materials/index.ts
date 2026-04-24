export { materialApi } from './api/materialApi';
export {
  useGetMaterialsQuery,
  useGetMaterialQuery,
  useGetMaterialCategoriesQuery,
  useMarkMaterialAsReadMutation,
  useDownloadMaterialMutation,
  useDeleteDownloadedMaterialMutation,
  useSearchMaterialsQuery,
  useGetProjectMaterialsQuery,
} from './api/materialApi';
export type {
  Material,
  MaterialType,
  MaterialListParams,
  MaterialListResponse,
  MaterialCategory,
  DownloadProgress,
} from './api/types';
