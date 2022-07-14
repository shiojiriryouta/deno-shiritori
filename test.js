import { serve } from "https://deno.land/std@0.138.0/http/server.ts"


console.log("Listening on http://localhost:8000");
serve(req => {

    let a = ["a",'A','S'];
    let b = a;
    console.log(a)
    a = [];
    return new Response(`a:${a} , b:${b}`);

});