var express = require('express'),
  ffmpeg = require('fluent-ffmpeg');

var app = express();

app.use(express.static(__dirname + '/app'));

app.get('/', function(req, res) {
  res.send('index.html');
});

app.get('/flash/:filename', function(req, res) {
  res.contentType('flv');
  // make sure you set the correct path to your video file storage
  var pathToMovie = __dirname + '/media/' + req.params.filename;
  var proc = ffmpeg(pathToMovie)
    // use the 'flashvideo' preset (located in /lib/presets/flashvideo.js)
    .preset('flashvideo')
    // setup event handlers
    .on('end', function() {
      console.log('file has been converted succesfully');
    })
    .on('error', function(err) {
      console.log('an error happened: ' + err.message);
    })
    // save to stream
    .pipe(res, {end:true});
});

app.get('/webm/:filename', function(req, res) {
  res.contentType('video/webm');
  // make sure you set the correct path to your video file storage
  var pathToMovie = __dirname + '/media/' + req.params.filename;
  var proc = ffmpeg(pathToMovie)
    /* Output to Hybinar server */
      .output('rtmp://hybinar.ru/live/egor')
      .format('flv')
      .audioCodec('libvo_aacenc')
      .audioBitrate('64k')
      .addOption('-ar', 48000)
      .videoCodec('libx264')
      .videoBitrate('512k')
      .addOption('-preset', 'ultrafast')
      .addOption('-tune', 'zerolatency')
      .addOption('-analyzeduration', '0')
    /* Output to Express stream */
      .output(res, {end:true})
      .format('webm')
      .audioCodec('libvorbis')
      .audioBitrate('64k')
      .addOption('-ar', 48000)
      .videoCodec('libvpx')
      .videoBitrate('512k')
      .addOption('-g', '52')
      .addOption('-lag-in-frames', '1')
      .addOption('-slices', '4')
      .addOption('-cpu-used', '4')
      .addOption('-deadline', 'realtime')
      .addOption('-bufsize', '512')
      .on('end', function() {console.log('file has been converted succesfully');})
      .on('error', function(err) {console.log('an error happened: ' + err.message);})
      .run();
});

app.listen(4000);
