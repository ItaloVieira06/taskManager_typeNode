export function buildRoutePath(path: string): RegExp {
    const routeParametersRegex = /:([a-zA-Z]+)/g

    const pathWithParams = path.replaceAll(
        routeParametersRegex,
        '(?<id>[a-z0-9\\-_]+)'
    )

    const pathRegex = new RegExp(`^${pathWithParams}(?<query>\\?(.*))?$`)

    return pathRegex
}