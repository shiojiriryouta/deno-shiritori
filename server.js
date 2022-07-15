import { serve } from "https://deno.land/std@0.138.0/http/server.ts"
import { serveDir } from "https://deno.land/std@0.138.0/http/file_server.ts";
function doReload() {
 
  // reloadメソッドによりページをリロード
  window.location.reload();
}
let previousWord = "しりとり";
//過去に出てきた文字列を保存
let wordlog = [];
let logcheck = [];
let randomword = ["あたま","つまさき","しょうげき","いなずま","おれたち","みみ","ゆさぶり","おと","いたずら","みのり","かじつ","やばい","ぼると","じだい","いま","びーと"];
let num = Math.floor(Math.random() * randomword.length) ;
previousWord = randomword[num];
console.log("Listening on http://localhost:8000");
serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);
  if (req.method === "GET" && pathname === "/shiritori") {
    //画面に文字を表示してる
    return new Response(`前の単語:  ${previousWord}\n[単語の履歴]\n${wordlog.join("\n")}`);
  }
  if (req.method === "POST" && pathname === "/shiritori") {
    const requestJson = await req.json();
    const nextWord = requestJson.nextWord;
    ////各種条件を判定する領域
    //送信した文字がひらがなか判定
    let regexp = /^[\u{3000}-\u{301C}\u{3041}-\u{3093}\u{309B}-\u{309E}\u{30FC}]+$/mu;
    if(!(regexp).test(String(nextWord))){
      return new Response("単語がひらがなではありません。", { status: 400 });
    }
    //送信した文字の語尾が前の文字の頭文字とつながっているか
    //charAtで文字列の特定の文字だけ切り抜いてる
    if (nextWord.length == 0 || previousWord.charAt(previousWord.length - 1) !== nextWord.charAt(0)) {
      //画面に文字を表示している
      return new Response("前の単語に続いていません。", { status: 400 });
    }
    //送信した文字が「ん」で終わっていないか
    if(nextWord.charAt(nextWord.length - 1) == 'ん'){
      wordlog = [];
      num = Math.floor(Math.random() * randomword.length);
      previousWord = randomword[num];
      return new Response("単語の語尾が「ん」なので終了しました。", { status: 400 });
    }

    //送信した文字が過去に使われていないか
    for(let i=0;i<wordlog.length;i++){
      if(wordlog[i] == nextWord || previousWord == nextWord){
        return new Response("この単語は過去に使われました。", { status: 400 });
      }
    }
    wordlog[wordlog.length] = previousWord;
    previousWord = nextWord;
    return new Response(`\n前の単語:${previousWord}\n[単語の履歴]\n${wordlog}`);
  }

  //リセットボタンを押したとき
  if(req.method === "POST" && pathname === "/reset"){
    wordlog = [];
    num = Math.floor(Math.random() * randomword.length);
    previousWord = randomword[num];
    return new Response("しりとりをリセットしました");
  }

  if(logcheck === wordlog){
    logcheck = wordlog;
    location.reload();
    return new Response("しりとりをリセットしました");
  }
  //Denoの標準ライブラリを使ってpublic フォルダの任意のファイルが
  //拡張子に合わせて適切な Content-Type ヘッダがセットされて返ってくる
  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});