# Nova Canvas 着せ替え機能のデモ

## 概要

Nova Canvas 着せ替え機能を触ってみるためのデモアプリ
現在はローカルであらかじめ用意した画像で動かすだけ
今後はlambdaで動かしてwebサイトからアップした画像を編集して表示する機能まで作りたい



##  実行手順

1. pipenv 
1. bedrockのAPIキーを発行
1. 環境変数にAPIキーをセット
   ```
   export AWS_BEARER_TOKEN_BEDROCK=${APIキー}
   ```
1. main.pyを実行

## 参考

* https://aws.amazon.com/jp/blogs/news/amazon-nova-canvas-update-virtual-try-on-and-style-options-now-available/
* https://docs.aws.amazon.com/nova/latest/userguide/image-gen-vto.html
* http://docs.aws.amazon.com/ja_jp/nova/latest/userguide/image-gen-req-resp-structure.html
* https://qiita.com/ren8k/items/af7b127cdffd859856f2