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

docker pull docker.elastic.co/app-search/app-search:7.6.2

sudo docker run -p 3002:3002 \
--net elastic \
-e elasticsearch.host='http://es01-test:9200' \
-e elasticsearch.username=elastic \
-e elasticsearch.password=changeme \
-e allow_es_settings_modification=true \
docker.elastic.co/app-search/app-search:7.6.2
```