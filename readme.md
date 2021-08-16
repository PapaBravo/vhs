# First time setup
## Pull images
```sh
docker pull docker.elastic.co/elasticsearch/elasticsearch:7.13.2
docker pull docker.elastic.co/kibana/kibana:7.13.2
docker pull mediagis/nominatim:3.7

```
## Start images for the first time
```sh
docker network create elastic
docker run --name es01-test --net elastic -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e 'http.cors.enabled=true' -e 'http.cors.allow-origin=/https?:\/\/localhost(:[0-9]+)?/' docker.elastic.co/elasticsearch/elasticsearch:7.13.2
docker run --name kib01-test --net elastic -p 5601:5601 -e "ELASTICSEARCH_HOSTS=http://es01-test:9200" docker.elastic.co/kibana/kibana:7.13.2
docker run --name nominatim --rm -e PBF_URL=https://download.geofabrik.de/europe/germany/berlin-latest.osm.pbf -e REPLICATION_URL=https://download.geofabrik.de/europe/germany/berlin-updates/ -p 8080:8080 mediagis/nominatim:3.7
```

## Start images later
```sh
docker start es01-test
docker start kib01-test
docker start nominatim
```

## Environment
For local deployment with docker, copy the env template

```sh
cp transformer/local.env transformer/.env
```
For production deployments, change host and password accordingly.

## Set up Elastic and Kibana

```sh
sudo docker network create elastic
sudo docker pull docker.elastic.co/elasticsearch/elasticsearch:7.13.2
sudo docker run --name es01-test --net elastic -p 9200:9200 -p 9300:9300 \
-e "discovery.type=single-node" \
-e 'http.cors.enabled=true' \
-e 'http.cors.allow-origin=/https?:\/\/localhost(:[0-9]+)?/' \
docker.elastic.co/elasticsearch/elasticsearch:7.13.2

sudo docker pull docker.elastic.co/kibana/kibana:7.13.2
sudo docker run --name kib01-test --net elastic -p 5601:5601 -e "ELASTICSEARCH_HOSTS=http://es01-test:9200" docker.elastic.co/kibana/kibana:7.13.2

sudo docker run -p 3002:3002 \
--net elastic \
-e elasticsearch.host='http://es01-test:9200' \
-e elasticsearch.username=elastic \
-e elasticsearch.password=changeme \
-e allow_es_settings_modification=true \
docker.elastic.co/app-search/app-search:7.6.2
```

## Geocoding
See http://nominatim.org/release-docs/latest/api/Search/
and docker https://github.com/mediagis/nominatim-docker/tree/master/3.7

```sh
sudo docker run -it --rm \
  -e PBF_URL=https://download.geofabrik.de/europe/germany/berlin-latest.osm.pbf \
  -e REPLICATION_URL=https://download.geofabrik.de/europe/germany/berlin-updates/ \
  -p 8080:8080 \
  --name nominatim \
  mediagis/nominatim:3.7
```


```sh
curl -G \
--data-urlencode 'street=Königshorster Str. 6' \
--data-urlencode 'city=Berlin' \
--data-urlencode 'country=Deutschland' \
--data-urlencode 'postalcode=13439' \
http://localhost:8080/search.php
```

```json
[{
    "place_id":337222,
    "licence":"Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
    "osm_type":"node",
    "osm_id":2939076759,
    "boundingbox":["52.597558","52.597658","13.3520421","13.3521421"],
    "lat":"52.597608","lon":"13.3520921",
    "display_name":"6, Königshorster Straße, Märkisches Viertel, Reinickendorf, Berlin, 13439, Deutschland","place_rank":30,"category":"place","type":"house","importance":0.640999999999999

```

