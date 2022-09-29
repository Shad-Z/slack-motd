# slack-motd / MEME OF THE DAY (MOTD)

## Principe 

Tout les jours un meme est posté. Les gens doivent écrire une phrase qui match bien avec le même. Les gens votent ensuite pour la phrase qui les fait le plus rire et à la fin de la journée on élit un gagnant (la phrase avec le plus de réaction)

## MVP 

* Bot slack
	* Meme aléatoire
	* 2 / Jour (9h / 18h)
	* Les gens répondent en thread avec une phrase (drôle de preference)
	* Les gens peuvent réagir à la phrase qui les fait le plus rire (via Emoji)
	* Compter les réactions pour avoir le gagnant

## Stack / Tech

* SDK (https://api.slack.com/tools/bolt) ou API Slack
* NodeJS ( + TS)
* Github
	* CI / CD
	* Gestion de projet
*  Possibilité de le faire stateless
* Firebase (scheduler / cloud function)
* Log

## TODO

* POST message avec le meme
* GET compter les réactions + selection gagnant
* POST message meme + gagnant
* Choisir une source de meme
* Création du slack de test (+ api key)
* Création du repo (privé pour le moment)

## Nice to have

* Generer le meme avec la phrase du gagnant
* Exploiter les datas
* Open telemetry
* docker

## Comment utiliser en dev

```shell
npm install -g firebase-tools
firebase login
cd functions
export SLACK_TOKEN=<le token slack>
npm run serve
```

## Comment set la config dans firebase

```shell
firebase functions:config:set slack.token="le token"
firebase functions:config:set slack.channel="meme-of-the-day-game"
```

## Comment déployer

```shell
firebase deploy --only functions
```
