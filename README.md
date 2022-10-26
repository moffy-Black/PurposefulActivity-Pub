# purposefulActivity

ゼミの仲間でハッカソンをする過程でオンラインコミュニケーションが必要になった。仲間内に聾唖者の子が居て,Zoom や google meet では十分にコミュニケーションできなかったため、[soft systems methodology](https://en.wikipedia.org/wiki/Soft_systems_methodology) [Checkland 90]で要求分析を行なって作られた作品。この作品によりコミュニケーションの速度・正確性・感情伝達・参入性において改善が見られた。

## デモ動画

[click the video](https://youtu.be/jwWmYjBuda0)

## 要件定義書類・ユースケース図

[click the doc](https://docs.google.com/document/d/1fA0udpq6TOfiskC6zs3WFyoKGpY-fgwF0hLR-N9wPY4/edit?usp=sharing)

## 開発環境について

1. docker image を作成する

```
~/purposefulActivity $ docker compose build
```

2. ./src/app/node_modules の作成

```
~/purposefulActivity $ docker compose run --rm react-app sh -c "npm install"
```

3. コンテナ起動

```
~/purposefulActivity $ docker compose up
```

⚠︎ 少し時間がかかります

4. ブラウザで接続

[http://localhost:3000/](http://localhost:3000/)

## テスト
``` docker-compose.yaml
command: sh -c "npm test"
```

## デプロイ
リポジトリのルートフォルダで
```
docker buildx build --platform linux/amd64 --tag gcr.io/directed-fabric-360008/purposeful-activity .
```
```
docker push gcr.io/directed-fabric-360008/purposeful-activity
```
### local確認
```
docker run -p 8080:8080 --rm gcr.io/directed-fabric-360008/purposeful-activity
```