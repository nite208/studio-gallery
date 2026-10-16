import { onRequestPost as __api_auth_login_ts_onRequestPost } from "D:\\studio-gallery\\functions\\api\\auth\\login.ts"
import { onRequestPost as __api_auth_logout_ts_onRequestPost } from "D:\\studio-gallery\\functions\\api\\auth\\logout.ts"
import { onRequestGet as __api_auth_session_ts_onRequestGet } from "D:\\studio-gallery\\functions\\api\\auth\\session.ts"
import { onRequestPost as __api_photos_sign_ts_onRequestPost } from "D:\\studio-gallery\\functions\\api\\photos\\sign.ts"
import { onRequestGet as __api_health_ts_onRequestGet } from "D:\\studio-gallery\\functions\\api\\health.ts"
import { onRequestDelete as __api_photos_index_ts_onRequestDelete } from "D:\\studio-gallery\\functions\\api\\photos\\index.ts"
import { onRequestGet as __api_photos_index_ts_onRequestGet } from "D:\\studio-gallery\\functions\\api\\photos\\index.ts"

export const routes = [
    {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_ts_onRequestPost],
    },
  {
      routePath: "/api/auth/logout",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_logout_ts_onRequestPost],
    },
  {
      routePath: "/api/auth/session",
      mountPath: "/api/auth",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_session_ts_onRequestGet],
    },
  {
      routePath: "/api/photos/sign",
      mountPath: "/api/photos",
      method: "POST",
      middlewares: [],
      modules: [__api_photos_sign_ts_onRequestPost],
    },
  {
      routePath: "/api/health",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_health_ts_onRequestGet],
    },
  {
      routePath: "/api/photos",
      mountPath: "/api/photos",
      method: "DELETE",
      middlewares: [],
      modules: [__api_photos_index_ts_onRequestDelete],
    },
  {
      routePath: "/api/photos",
      mountPath: "/api/photos",
      method: "GET",
      middlewares: [],
      modules: [__api_photos_index_ts_onRequestGet],
    },
  ]