var jsdom = require("jsdom");
var request = require("request");
var connect = require("net").connect;
var c = require("chalk");
var HOST = "http://localhost";
var PORT = process.env.PORT || 3000;
var ENDPOINT = HOST + ':' + PORT;

var url = "http://haxfred.hax10m.com/extras/loglinks";

connect({port: PORT}, function () {
  scrape();
})
.on('error', function () {
  console.log(c.strikethrough('*******'));
  console.log(c.red("Server is not running at", PORT));
  console.log(c.blue("Please start it"));
  console.log(c.strikethrough('*******'));
});

function scrape () {
  jsdom.env(
    url,
    function ( errors, window ) {
      if (errors) {
        console.log("Errors: ");
        console.log(errors);
      } else {
        console.log('Links downloaded');

        var $ = require('jquery')(window);

        function get_user_n_caption_n_created_date(el) {
          var user,
          caption,
          postDate = get_created_date(el);
          if ( $(el).find('.postMessage').text().match(/:/) ) {
            var postMessage = $(el).find('.postMessage').text().match(/^(.*?)(: )(.*)/);
            user = postMessage[1];
            caption = postMessage[3];
          } else {
            user = $(el).find('.postMessage').text();
            caption = '';
          }

          return {
            user: user,
            caption: caption,
            postDate: postDate
          };
        }

        function get_created_date(el) {
          var rawDate = $(el).find('.when').text(),
          calDate = rawDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/),
          timeDate = rawDate.match(/(\d{1,2}):(\d{2})([ap]m)/);

          if(timeDate[3] == 'pm') {
            timeDate[1] = parseInt(timeDate[1]) + 12;
          } else if(timeDate[1] == 12) {
            timeDate[1] = 0;
          }

          return new Date(calDate[3], calDate[1] - 1, calDate[2], timeDate[1], timeDate[2]);
        }

        function post_image(el) {
          var href = $( el ).find('img').attr('src');

          var info = get_user_n_caption_n_created_date(el);

          post_link({
            url: href,
            type: 'image',
            user: info.user,
            caption: info.caption,
            postDate: info.postDate
          })
        }

        function post_article(el) {
          var href = $( el ).find('.article').attr('href');

          var info = get_user_n_caption_n_created_date(el);

          post_link({
            url: href,
            type: 'article',
            user: info.user,
            caption: info.caption,
            postDate: info.postDate
          })
        }

        function post_youtube(el) {
          var href = $( el ).find('iframe').attr('src');
          var partialLink;
          if(href.indexOf("embed/?list=") > -1) {
            var matches = href.match(/=(.+)$/);
            partialLink = matches[1];
          } else {
            var matches = href.match(/embed\/(.+)$/);
            if ( !!matches ) {
              partialLink = matches[1];
            }
          }

          if(partialLink) {
            partialLink = "http://youtu.be/" + partialLink
          }

          var info = get_user_n_caption_n_created_date(el);

          post_link({
            url: partialLink,
            type: 'youtube',
            user: info.user,
            caption: info.caption,
            postDate: info.postDate
          });
        }

        function post_vimeo(el) {
          var href = $( el ).find('iframe').attr('src');
          var matches = href.match(/\/(\d+)\?/);
          var partialLink = "https://vimeo.com/" + matches[1];

          var info = get_user_n_caption_n_created_date(el);

          post_link({
            url: partialLink,
            type: 'vimeo',
            user: info.user,
            caption: info.caption,
            postDate: info.postDate
          });
        }

        function post_link(data) {
          console.log('Creating: ' + data.url);
          request.post(
            ENDPOINT + '/api/links',
            { form: data },
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                console.log('✓ ' + data.url);
              } else {
                console.log('✗ ' + data.url);
              }
            }
          );
        }

        $.each($('.irc-link').get().reverse(), function(i, el) {
          if ( $( el ).find('.article').length > 0 ) {
            post_article(el);
          } else if ( $( el ).find('iframe').length > 0 && $( el ).find('iframe').attr('src').match(/youtube/gi) ) {
            console.log("YOUTUBE");
            post_youtube(el);
          } else if ( $( el ).find('iframe').length > 0 && $( el ).find('iframe').attr('src').match(/vimeo/gi) ) {
            console.log("VIMEO");
            post_vimeo(el);
          } else if ( $( el ).find('img').length > 0 ) {
            console.log("IMAGE");
            post_image(el);
          } else {
            post_article(el);
          }
        });
      }
    }
  );
}
