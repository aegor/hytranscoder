var express = require('express'),
    ffmpeg = require('fluent-ffmpeg');

var app = express();

app.get('/webm/:filename', function(req, res) {
  res.contentType('video/webm');
  // make sure you set the correct path to your video file storage
  var pathToMovie = __dirname +  '/media/' + req.params.filename;
  req.query.offset ? offset = req.query.offset : offset = 0;
  req.query.stream ? rtmpStream = req.query.stream : rtmpStream = 'teacher';
  req.query.server ? rtmpServer = req.query.server : rtmpServer = 'hybinar.ru/live';
  console.log('offset: ', offset);
  console.log('rtmpServer: ', 'rtmp://' + rtmpServer + '/' + rtmpStream);
  var proc = ffmpeg(pathToMovie)
      .seekInput(offset)
    /* Output to Hybinar server */
      .output('rtmp://' + rtmpServer + '/' + rtmpStream)
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
      .on('end', function() {console.log('End of file reached');})
      .on('error', function(err) {"ffmpeg instance destroyed, ", console.log(err.message);})
      .run();
});
app.listen(5000);
