function HueManager(){
     this.hueUsername = "hSbN2GLU29PXJXnaIgr02dptpwJvUS3CHr64U90Z";
     this.hueIpAddress = "192.168.1.206";
     this.apiUrl = `https://${this.hueIpAddress}/api/${this.hueUsername}`;
}

/**
 * Change light color
 */
HueManager.prototype.setLightColor = function(lightId, rgb){
     var url = `${this.apiUrl}/lights/${lightId}/state/`

     //convert rgb to hsv
     var hsb = this.rgb2hsv(rgb.r, rgb.g, rgb.b);

     //set state
     var colorState = {};
     colorState.hue = Math.round(hsb.h * 182.04);
     colorState.sat = Math.round((255 * hsb.s) / 100);
     colorState.bri = Math.round((255 * hsb.v) / 100);

     $.ajax({
          url: url,
          method: 'PUT',
          dataType: 'json',
          contentType: 'application/json',
          data: JSON.stringify(colorState),
          success: function(response){
               if(typeof response[0].error == "undefined"){
                    console.log(`Philips Hue light ID ${lightId} successfully changed.`);
               } else {
                    console.log(`Philips Hue light ID ${lightId} reports error.`, response[0].error);
               }
          },
          error: function(xhr, status){
               console.log("Error.");
          }
     });

}

//https://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript
HueManager.prototype.rgb2hsv = function(r, g, b) {
    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
    rabs = r / 255;
    gabs = g / 255;
    babs = b / 255;
    v = Math.max(rabs, gabs, babs),
    diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    percentRoundFn = num => Math.round(num * 100) / 100;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: percentRoundFn(s * 100),
        v: percentRoundFn(v * 100)
    };
}
