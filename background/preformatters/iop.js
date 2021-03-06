var BINPreformatter = ( function () {

	// a shadow as a "promise not to touch global data and variables". Must be included to be accepted!
	var BINData = null;
	var BINInteraction = null;
	var BINParser =  null;
	var window = null;
	var document = null;
	
	//preformat raw data including raw RIS
	function preformatRawData(metaData, parser) {
		
		//downloaded citation is crap on iop journals (books are ok actually)
		if (metaData["citation_type"].search(/isbn/i) == -1) metaData["citation_download"] = metaData["citation_download"].replace(/(?:A1|AU)[\t\ ]+[\-]+[\t\ ]+/g,"BIT - ").trim();
	}
	
	//preformatting function
	function preformatData(metaData, parser) {
		
		//check if book
		let misc = metaData["citation_type"];
		if (misc.search(/isbn/i) != -1) {
			misc = misc.split(";");
			if (misc != null && misc.length > 0) {
				misc = misc[0].trim();
				metaData["citation_type"] = "book";
				metaData["citation_issn"] = misc;
				
				//fix subtitle
				misc = metaData["citation_misc"];
				if (misc != "") {
					let title = metaData["citation_title"];
					if (title != "") {
						metaData["citation_title"] = title + " -- " + misc;
					}
				}
				
				//fix author if book
				metaData["citation_authors"] = metaData["citation_authors"].replace(/([\s]+and[\s]+|[\s]*\,[\s]*)/g," ; ");
			}
		}
		
		//fix dynamic title, date and abstract
		misc = metaData["citation_download"];
		if (misc != null && typeof(misc) == 'object') {
			
			//prefer static title
			if (metaData["citation_title"] != "") {
				misc["citation_title"] = "";
			}
			
			misc = misc["citation_date"];
			if (misc != "") {
				let date = metaData["citation_date"];
				metaData["citation_download"]["citation_date"] = date.search(new RegExp("" + BINResources.escapeForRegExp(misc))) != -1 ? date : misc;
			}
			
			//if abstract obtained dynamically, extract math expressions
			if ((misc = metaData["citation_download"]["citation_abstract"]) != "") {
				metaData["citation_download"]["citation_abstract"] = misc.replace(/##[A-Z]+##[\s]*\[[^\]]*?\][\s]*?\{\$[\s]*(.*?)[\s]*\$\}/g, 
					function(match, $1, offset, original) {
						return "$"+$1+"$";
					}
				).replace(/##[A-Z]+##[\s]*\[[^\]]*?\][\ ]?/g,"");
			}
		}
		
		//fix publisher
		if (metaData["citation_publisher"] == "") metaData["citation_publisher"] = "IOP Publishing";
		
		//reset citation_misc
		metaData["citation_misc"] = "";
	}
	
	// expose preformatting function and raw preformatting function
	return { preformatData : preformatData , preformatRawData: preformatRawData };

}());
