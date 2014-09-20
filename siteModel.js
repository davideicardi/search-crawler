var mongoose = require('./mongoose-q.js');
var Schema = mongoose.Schema;

var PageModel = require('./pageModel.js');

// Site Schema
var siteSchema = new Schema({
						name: String,
						url: String,
						status: String,
						config: { 
								contentSelector : String, 
								urlPattern : String
						}
					});
					
siteSchema.methods.pagesCountQ = function () {
	var siteId = this._id.toString();
  return PageModel.where({siteId : siteId}).countQ();
};


var	SiteModel = mongoose.model("Site", siteSchema, "sites");


SiteModel.getByNameQ = function(name){
	if (typeof name !== "string"){
			throw new Error("name expected");
	}
	
	return SiteModel
		.where({name : name})
		.findOneQ()
		.then(function(site){
				if (!site) {
						throw new Error("Site '" + name + "' not found");
				}
		
				return site;
		});
};
SiteModel.findAllQ = function(){
	return SiteModel.where().findQ();
};


module.exports = SiteModel;
