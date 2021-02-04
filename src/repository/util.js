function makeRequest(method, url) {
	return new Promise(function (resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open(method, url);
		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				resolve(xhr.response);
			} else {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			}
		};
		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText
			});
		};
		xhr.send();
	});
}

export const loadTextResource = async url => {
	return await makeRequest('GET', url);
};

export const loadImage = url => {
	return new Promise(function (resolve, reject) {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject();
		image.src = url;
	});
};

export const loadJSONResource = async url => {
	const text = await loadTextResource(url);
	return JSON.parse(text);
};