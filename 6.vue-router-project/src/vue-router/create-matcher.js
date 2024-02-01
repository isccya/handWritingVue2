import createRouteMap from "./create-route-map";

export default function createMatcher(routes) {
    let { pathMap } = createRouteMap(routes);
    function addRoutes(routes) { // 动态添加路由
        createRouteMap(routes, pathMap);
       
    }
    function addRoute(route) {
        createRouteMap([route], pathMap);
    }
    function match(location) { 
        return pathMap[location]
    }
    return {
        addRoutes, // 添加路由 多个路由的
        addRoute, // 添加一个路由的
        match // 稍后你给我一个路径我就返回给你对应的路由
    }
}