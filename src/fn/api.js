import $ from "jquery"
import toastr from "toastr"

const api_url = "http://scratch.flyingbears.cn:9701/api"
// const api_url = "http://localhost:9701/api"
const apiName_prefix = "module_micro_api_scratch_flyingbears_cn_site.api."

function public_api(data) {
	return new Promise((resolve, reject) => {
		if (data.apiName.indexOf('.') == -1) {
			data.apiName = apiName_prefix + data.apiName
		}
		$.post(api_url, JSON.stringify(data), function(resp){
			if (resp.code === "success") {
				resolve(resp)
			} else {
				toastr.warning(resp.message ? resp.message : resp.code)
				reject(resp)
			}
		})
	})
}

export {
    public_api
}
