import remember, {forget} from "remember"

const ACCESS_TOKEN_STORAGE_KEY = "comptanar_github_access_token"

export function rememberToken(token){
    return remember(ACCESS_TOKEN_STORAGE_KEY, token)
}
export function forgetToken(){
    return forget(ACCESS_TOKEN_STORAGE_KEY)
}

