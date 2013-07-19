
	var uglify = function(canvas, mode, x, y, r, callback) {
		var ctx = canvas.getContext('2d');

		var imageR = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var imageO = ctx.getImageData(0, 0, canvas.width, canvas.height);

		var imageOD = imageO.data, imageRD = imageR.data;

		var centerX = x, centerY = y;

		var radius = r;

		var modes = {
			'zoomin': function(pix, radius) {
				var newPix = {};
				newPix.offsetD = pix.offsetD * ((+Math.cos(pix.offsetD / radius * Math.PI) + 1) / 4 + 1);
				newPix.angle = grad2rad(pix.angle);
				newPix.offsetX = Math.sin(newPix.angle) * newPix.offsetD;
				newPix.offsetY = Math.cos(newPix.angle) * newPix.offsetD;
				return newPix;
			},
			'zoomout': function(pix, radius) {
				var newPix = {};
				newPix.offsetD = pix.offsetD * ((-Math.cos(pix.offsetD / radius * Math.PI) - 1) / 4 + 1);
				newPix.angle = grad2rad(pix.angle);
				newPix.offsetX = Math.sin(newPix.angle) * newPix.offsetD;
				newPix.offsetY = Math.cos(newPix.angle) * newPix.offsetD;
				return newPix;
			},
			'twistright': function(pix, radius) {
				var newPix = {};
				newPix.offsetD = pix.offsetD;
				newPix.angle = grad2rad(pix.angle + (radius - pix.offsetD) / 1);
				newPix.offsetX = Math.sin(newPix.angle) * newPix.offsetD;
				newPix.offsetY = Math.cos(newPix.angle) * newPix.offsetD;
				return newPix;
			},
			'twistleft': function(pix, radius) {
				var newPix = {};
				newPix.offsetD = pix.offsetD;
				newPix.angle = grad2rad(pix.angle - (radius - pix.offsetD) / 1);
				newPix.offsetX = Math.sin(newPix.angle) * newPix.offsetD;
				newPix.offsetY = Math.cos(newPix.angle) * newPix.offsetD;
				return newPix;
			}
		};

		for (var pixY = 0; pixY < canvas.height; pixY++) {
			for (var pixX = 0; pixX < canvas.width; pixX++) {
				var pix = {};
				pix.offsetX = (pixX - centerX);
				pix.offsetY = (pixY - centerY);
				pix.offsetD = Math.abs(Math.sqrt(Math.abs(pix.offsetX * pix.offsetX) + Math.abs(pix.offsetY * pix.offsetY)));
				pix.angle = getAngle(pix.offsetX, pix.offsetY);

				if (pix.offsetD > 0 && pix.offsetD < radius) {
					var newPix = modes[mode](pix, radius);
					var z = (pixY * canvas.width + pixX) * 4;
					var nz = ((Math.round(centerY + newPix.offsetY) * canvas.width + Math.round(centerX + newPix.offsetX))) * 4;
				} else {
					var z = (pixY * canvas.width + pixX) * 4;
					var nz = (pixY * canvas.width + pixX) * 4;
				}
				imageRD[z] = imageOD[nz] || 0; 	// red
				imageRD[z + 1] = imageOD[nz + 1] || 0; 	// green
				imageRD[z + 2] = imageOD[nz + 2] || 0; 	// blue
			}
		}

		function rad2grad(rad) {
			return rad * 180 / Math.PI;
		}

		function grad2rad(grad) {
			return grad * Math.PI / 180;
		}

		function getAngle(a, b) {
			var c = Math.sqrt(a * a + b * b);
			var nw = rad2grad(Math.asin(a / c));
			if (a < 0 && b < 0) {
				nw = -nw - 180;
			} else if (b < 0) {
				nw = 180 - nw;
			}
			return nw;
		}

		function vPercents2Px(per) {
			return Math.ceil((canvas.height / 100) * per);
		}

		function hPercents2Px(per) {
			return Math.ceil((canvas.width / 100) * per);
		}

		function dPercents2Px(per) { // dagonal
			var w = canvas.width;
			var h = canvas.height;
			return Math.ceil((Math.sqrt(w * w + h * h) / 100) * per);
		}

		function vPx2Percents(px) {
			return Math.ceil(px * 100 / canvas.height);
		}

		function hPx2Percents(px) {
			return Math.ceil(px * 100 / canvas.width);
		}

		function dPx2Percents(px) { // dagonal
			var w = canvas.width;
			var h = canvas.height;
			return Math.ceil(px * 100 / Math.sqrt(w * w + h * h));
		}


ctx.putImageData(imageR, 0, 0);
		if (callback) {
			callback(imageR);
		} else {
			return imageR;
		}
	};
