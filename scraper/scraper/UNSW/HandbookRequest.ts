export const handbookRequestPayload = {
  "track_scores": false,
  "query": {
    "filtered": {
      "query": {
        "bool": {
          "must": [{
            "query_string": {
              "fields": ["*study_level_value*"],
              "query": "*grd*"
            }
          }, {
            "query_string": {
              "fields": ["*.active"],
              "query": "*1*"
            }
          }]
        }
      },
      "filter": {
        "bool": {
          "should": [{
            "term": {
              "contenttype": "subject"
            }
          }],
          "must_not": [{
            "missing": {
              "field": "*.name"
            }
          }, {
            "term": {
              "subject.published_in_handbook": "0000000000000000000.000000000000000000"
            }
          }]
        }
      }
    }
  },
  "size": 10000,
  "sort": [{
    "subject.code": "asc"
  }]
};

export default handbookRequestPayload;
