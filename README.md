benicio
=======

![benico del toro](https://raw.github.com/haxiom/benicio/development/benicio.jpg)

A collector of links.

## Rest API

### Service

To start the service:

```shell
node index.js
```

### GET

You can then get a total list of links like so:

```shell
curl http://localhost:3000/api/links
```

To get only youtube videos:

```shell
curl http://localhost:3000/api/links?type=youtube
```

To get the 3rd page of 5 entries:

```shell
curl http://localhost:3000/api/links?_limit=5&_offset=15
```

## POST

To Post/Create a new link:

```shell
curl -d "user=joeshmoe" -d "url=http://lejeunerenard.com/" -d "type=article" -d "caption=This is a really cool site" http://localhost:3000/api/links
```

## Tools

### Converter

To convert the current logged links:

```shell
node bin/convert-to-db.js
```

### Open tool

To open the most recent link on haxfred:

```shell
node bin/hax-open.js
```
