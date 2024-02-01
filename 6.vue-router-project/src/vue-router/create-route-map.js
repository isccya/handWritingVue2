export default function createRouteMap(routes, pathMap) { // 根据用户选项扁平化路由的信息
    pathMap = pathMap || {};
    routes.forEach(route => {
        addRouteRecord(route, pathMap);
    });
  
    return {
        pathMap
    }
}
function addRouteRecord(route, pathMap, parentRecord) {
    let path = parentRecord ? `${parentRecord.path === '/' ? '/' : `${parentRecord.path}/`}${route.path}` : route.path
    let record = {
        path,
        component: route.component,
        props: route.props,
        meta: route.meta,
        parent:parentRecord
    }
    if (!pathMap[path]) {
        // 维护路径对应的属性
        pathMap[path] = record; // 路径和记录对应起来
    }
    route.children && route.children.forEach(childRoute => {
        addRouteRecord(childRoute, pathMap, record);
    })
}
