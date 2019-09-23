declare module 'os-keycode' {

    interface KeycodeInfo {
        code: number;
        key?: string;
        keys: string[];
    }
    function keyname(code : number): KeycodeInfo | undefined;
    function keycode(key: string) : number;
}