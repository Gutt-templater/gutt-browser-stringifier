module.exports = function (ctx, params) {
	function addIfModule(positive, negative) {
		return params.type === 'module' ? positive : negative || ''
	}

	var createInstructions = [],
		templates = [],
		instructions = [],
		dynamicNodes = [],
		imports = [],
		field

	for (field in ctx.dynamicNodes) {
		if (ctx.dynamicNodes.hasOwnProperty(field)) {
			dynamicNodes.push(
				field + ': ' + ctx.dynamicNodes[field]
			)
		}
	}

	for (field in ctx.templates) {
		if (ctx.templates.hasOwnProperty(field)) {
			templates.push(
				field + ': ' + addIfModule('async ') + 'function (layer) {\n\
	layer.index = -1\n\
' + ctx.templates[field] + '\n\
	' + addIfModule('await ') + 'handleTail(layer)\n\
}'
			)
		}
	}

	for (field in ctx.createInstructions) {
		if (ctx.createInstructions.hasOwnProperty(field)) {
			instructions[field] = field + ': ' + addIfModule('async ') + 'function (layer) {\n\
	layer.elements[' + field + '] = ' + addIfModule('await ') + 'createNodes(' + ctx.createInstructions[field] + ', layer.lookahead[' + field + '][0])\n\
	insertLayerElements(layer, ' + field + ')\n\
}'
		}
	}

	for (field in ctx.arrayInstructions) {
		if (ctx.arrayInstructions.hasOwnProperty(field)) {
			instructions[field] = field + ': ' + addIfModule('async ') + 'function (layer) {\n\
' + ctx.arrayInstructions[field] + '\n\
}'
		}
	}

	for (field in ctx.executeInstructions) {
		if (ctx.executeInstructions.hasOwnProperty(field)) {
			instructions[field] = field + ': function (layer) {\n\
				' + ctx.executeInstructions[field] + '\n\
			}'
		}
	}

	for (field in ctx.componentInstuctions) {
		if (ctx.componentInstuctions.hasOwnProperty(field)) {
			instructions[field] = field + ': ' + addIfModule('async ') + 'function (layer) {\n\
				' + ctx.componentInstuctions[field] + '\n\
			}'
		}
	}

	for (field in ctx.textInstructions) {
		if (ctx.textInstructions.hasOwnProperty(field)) {
			instructions[field] = field + ': function (layer) {\n\
				' + ctx.textInstructions[field] + '\n\
			}'
		}
	}

	for (field in ctx.imports) {
		if (ctx.imports.hasOwnProperty(field)) {
			imports.push(
				'\'' + field + '\': ' + addIfModule('import', 'require') + '(' + ctx.imports[field] + ')'
			)
		}
	}

	return 'const main = ' + addIfModule('async ') + 'function (mountNode) {\n\
	var MKARR_OPEN = 2 << 1;\n\
	var MKARR_CLOSE = 1 << 1;\n\
	function mkArr(start, end, flag) {\n\
		var arr = [], i;\n\
		if (flag & MKARR_OPEN) {\n\
			if (start <= end) {\n\
				for (i = start; i < end; i++) {\n\
					arr.push(i);\n\
				}\n\
			} else {\n\
				for (i = start; i > end; i--) {\n\
					arr.push(i);\n\
				}\n\
			}\n\
		} else if (flag & MKARR_CLOSE) {\n\
			if (start <= end) {\n\
				for (i = start; i <= end; i++) {\n\
					arr.push(i);\n\
				}\n\
			} else {\n\
				for (i = start; i >= end; i--) {\n\
					arr.push(i);\n\
				}\n\
			}\n\
		}\n\
		return arr;\n\
	}\n\
	function str(str, len, sprtr) {\n\
		if (!len) len = 0;\n\
		if (typeof str.toString === \'function\') str = str.toString();\n\
		if (!sprtr) sprtr = \'.\';\n\
		if (~str.indexOf(\'.\')) {\n\
			if (len > 0) {\n\
				str = str.substr(0, str.indexOf(\'.\') + len + 1);\n\
			} else {\n\
				str = str.substr(0, str.indexOf(\'.\') + len);\n\
			}\n\
		} else {\n\
			str = str_pad(str + \'.\', str.length + 1 + len, \'0\');\n\
		}\n\
		return str.replace(\'.\', sprtr);\n\
	}\n\
	function str_replace(str, src, rep) {\n\
		while (~str.indexOf(src)) {\n\
			str = str.replace(src, rep);\n\
		}\n\
		return str;\n\
	}\n\
	var STRPADRIGHT = 1 << 1;\n\
	var STRPADLEFT = 2 << 1;\n\
	var STRPADBOTH = 4 << 1;\n\
	var booleanAttributes = [\n\
		\'autofocus\',\n\
		\'autoplay\',\n\
		\'async\',\n\
		\'checked\',\n\
		\'defer\',\n\
		\'disabled\',\n\
		\'hidden\',\n\
		\'loop\',\n\
		\'multiple\',\n\
		\'muted\',\n\
		\'nomodule\',\n\
		\'open\',\n\
		\'preload\',\n\
		\'required\',\n\
		\'selected\'\n\
	]\n\
	function __str_pad_repeater(str, len) {\n\
		var collect = \'\', i;\n\
		while(collect.length < len) collect += str;\n\
		collect = collect.substr(0, len);\n\
		return collect;\n\
	}\n\
	function str_pad_left(str, len, sub) {\n\
		return str_pad(str, len, sub, STRPADLEFT);\n\
	}\n\
	function str_pad_right(str, len, sub) {\n\
		return str_pad(str, len, sub, STRPADRIGHT);\n\
	}\n\
	function str_pad_both(str, len, sub) {\n\
		return str_pad(str, len, sub, STRPADBOTH);\n\
	}\n\
	function str_pad(str, len, sub, type) {\n\
		if (typeof type === \'undefined\') type = STRPADRIGHT;\n\
		var half = \'\', pad_to_go;\n\
		if ((pad_to_go = len - str.length) > 0) {\n\
			if (type & STRPADLEFT) { str = __str_pad_repeater(sub, pad_to_go) + str; }\n\
			else if (type & STRPADRIGHT) {str = str + __str_pad_repeater(sub, pad_to_go); }\n\
			else if (type & STRPADBOTH) {\n\
				half = __str_pad_repeater(sub, Math.ceil(pad_to_go/2));\n\
				str = half + str + half;\n\
				str = str.substr(0, len);\n\
			}\n\
		}\n\
		return str;\n\
	}\n\
	function str_htmlescape(html) {\n\
		return html.replace(/&/g, "&amp;")\n\
		.replace(/\\</g, "&lt;")\n\
		.replace(/\\>/g, "&gt;")\n\
		.replace(/\\"/g, "&quot;");\n\
	}\n\
	function str_upfirst(str) {\n\
		return str.split(/[\\s\\n\\t]+/).map(function (item) {\n\
			return item.substr(0, 1).toUpperCase() + item.substr(1).toLowerCase();\n\
		}).join(\' \');\n\
	}\n\
	function str_camel(str) {\n\
		return str.split(/[\\s\\n\\t]+/).map(function (item, index) {\n\
			if (!index) return item;\n\
			return item.substr(0, 1).toUpperCase() + item.substr(1).toLowerCase();\n\
		}).join(\'\');\n\
	}\n\
	function str_kebab(str) {\n\
		return str.split(/[\\s\\n\\t]+/).join(\'-\');\n\
	}\n\
	function arr_values(obj) {\n\
		var values = [], i;\n\
		for(i in obj) if (Object.prototype.hasOwnProperty.call(obj, i)) values.push(obj[i]);\n\
		return values;\n\
	}\n\
	function arr_contain(obj, value) {\n\
		if(typeof obj.indexOf === \'function\') return obj.indexOf(value) !== -1;\n\
		var i;\n\
		for(i in obj) if (Object.prototype.hasOwnProperty.call(obj, i)) if (obj[i] === value) return true;\n\
		return false;\n\
	}\n\
	function arr_len(obj) {\n\
		if(typeof obj.length !== \'undefined\') return obj.length;\n\
		var i, length = 0;\n\
		for(i in obj) if (Object.prototype.hasOwnProperty.call(obj, i)) length++;\n\
		return length;\n\
	}\n\
	function arr_push(arr, value) {\n\
		arr.push(value);\n\
		return \'\';\n\
	}\n\
	function arr_unshift(arr, value) {\n\
		arr.unshift(value);\n\
		return \'\';\n\
	}\n\
	function arr_rand(arr, value) {\n\
		var keys = Object.keys(arr);\n\
		return arr[keys[parseInt(Math.random() * arr_len(arr) - 1)]];\n\
	}\n\
	function arr_splice(arr, st, en, els) {\n\
		var prms = [st];\n\
		if (typeof en !== \'undefined\') prms.push(en);\n\
		return Array.prototype.splice.apply(arr, prms.concat(els));\n\
	}\n\
	function arr_pad(src, len, el) {\n\
		var i, arr = src.slice(0);\n\
		if(len > 0) for(i = arr_len(arr);i < len;i++) arr.push(el);\n\
		if(len < 0) for(i = arr_len(arr);i < -len;i++) arr.unshift(el);\n\
		return arr;\n\
	}\n\
	function arr_reverse(src) {\n\
		var arr = src.slice(0);\n\
		arr.reverse();\n\
		return arr;\n\
	}\n\
	function arr_sort(src) {\n\
		var arr = src.slice(0);\n\
		arr.sort();\n\
		return arr;\n\
	}\n\
	function arr_sort_reverse(src) {\n\
		var arr = src.slice(0);\n\
		arr.sort();\n\
		arr.reverse();\n\
		return arr;\n\
	}\n\
	function arr_unique(src) {\n\
		var i, arr = [];\n\
		for(i in src) if (Object.prototype.hasOwnProperty.call(src, i)) if (!~arr.indexOf(src[i])) arr.push(src[i]);\n\
		return arr;\n\
	}\n\
	function arr_key(arr, value) {\n\
		var i;\n\
		for(i in arr) if (Object.prototype.hasOwnProperty.call(arr, i)) if (value == arr[i]) return i;\n\
		return -1;\n\
	}\n\
	var scope = {}\n\
	var state = {}\n\
	var childrenAnchor\n\
	var lookahead\n\
	var ATTRIBUTES = 1\n\
	var TEXT_NODE = 2\n\
	var ARRAY = 4\n\
	var EXECUTE = 8\n\
	var COMPONENT = 16\n\
	var rootElements = []\n\
	var imports = {\n\
' + imports.join(',\n') + '\n\
	}\n\
	var dynamicNodes = {\n\
' + dynamicNodes.join(',\n') + '\n\
	}\n\
	var layers = {\n\
		0: createLayer()\n\
	}\n\
\n\
	if (arguments.length === 2) {\n\
		state = arguments[1]\n\
	} else if (arguments.length > 2) {\n\
		layers[0].anchors[0] = arguments[1]\n\
		scope = arguments[2]\n\
		state = arguments[3]\n\
		lookahead = arguments[4]\n\
		childrenAnchor = arguments[5]\n\
	}\n\
\n\
	var instructions = {\n\
' + instructions.filter(Boolean).join(',\n') + '\n\
	}\n\
	var templates = {\n\
' + templates.join(',\n') + '\n\
	}\n\
	var avatarTextarea = document.createElement(\'textarea\')\n\
	var avatarDiv = document.createElement(\'div\')\n\
	var copy = Function.prototype.call.bind(Array.prototype.slice)\n\
\n\
	function createLayer() {\n\
		return {\n\
			index: 0,\n\
			state: [],\n\
			elements: {},\n\
			lookahead: {},\n\
			anchors: {},\n\
			children: {},\n\
			attributes: {},\n\
			components: {},\n\
			textCache: {}\n\
		}\n\
	}\n\
\n\
	' + addIfModule('async ') + 'function forEach(data, callback) {\n\
		var field\n\
\n\
		for (field in data) {\n\
			if (data.hasOwnProperty(field)) {\n\
				' + addIfModule('await ') + 'callback(data[field], field)\n\
			}\n\
		}\n\
	}\n\
\n\
	function indexOf(items, item, usedIndexes) {\n\
		var i\n\
\n\
		for (i = 0; i < items.length; i++) {\n\
			if (items[i] === item && usedIndexes.indexOf(i) === -1) {\n\
				return i\n\
			}\n\
		}\n\
\n\
		return -1\n\
	}\n\
\n\
	function handleArray(parentLayer, layerIndex, iterator) {\n\
		var index = 0, layer, preservedIndex, nextSibling, moveElement\n\
		var usedIndexes = []\n\
		var unusedIndexes = []\n\
		var children = createChildren(parentLayer, layerIndex)\n\
\n\
		iterator(' + addIfModule('async ') + 'function (field, item) {\n\
			preservedIndex = indexOf(children.items, item, usedIndexes)\n\
\n\
			if (preservedIndex === -1) {\n\
				layer = createLayer()\n\
\n\
				var anchor = createAnchor(layer, layerIndex + 1)\n\
\n\
				if (index < children.items.length) {\n\
					nextSibling = children.layers[index].elements[layerIndex + 1]\n\
\n\
					if (typeof nextSibling === \'undefined\') {\n\
						nextSibling = children.layers[index].anchors[layerIndex + 1]\n\
					} else if (nextSibling instanceof Array) {\n\
						nextSibling = nextSibling[0]\n\
					}\n\
\n\
					insertBefore(nextSibling.parentNode, anchor, nextSibling)\n\
				} else {\n\
					nextSibling = parentLayer.anchors[layerIndex]\n\
					insertBefore(nextSibling.parentNode, anchor, nextSibling)\n\
				}\n\
\n\
				children.layers.splice(index, 0, layer)\n\
				children.items.splice(index, 0, item)\n\
				usedIndexes.push(index)\n\
				layer.lookahead[layerIndex + 1] = { 0: parentLayer.lookahead[layerIndex][0] }\n\
\n\
				' + addIfModule('await ') + 'templates[layerIndex + 1](layer)\n\
			} else {\n\
				if (preservedIndex !== index) {\n\
					nextSibling = children.layers[index].anchors[layerIndex + 1]\n\
					moveElement = children.layers[preservedIndex].anchors[layerIndex + 1]\n\
					insertBefore(nextSibling.parentNode, moveElement, nextSibling)\n\
\n\
					moveElement = children.layers[preservedIndex].elements[layerIndex + 1]\n\
\n\
					if (typeof moveElement !== \'undefined\') {\n\
						moveElement.forEach(function (element) { insertBefore(nextSibling.parentNode, element, nextSibling) })\n\
					}\n\
\n\
					children.items.splice(index, 0, children.items.splice(preservedIndex, 1)[0])\n\
					children.layers.splice(index, 0, children.layers.splice(preservedIndex, 1)[0])\n\
				}\n\
\n\
				usedIndexes.push(index)\n\
				' + addIfModule('await ') + 'templates[layerIndex + 1](children.layers[index])\n\
			}\n\
\n\
			index++\n\
		})\n\
\n\
		usedIndexes.sort(function (a, b) { return a - b })\n\
\n\
		for (index = 0; index < usedIndexes.length; index++) {\n\
			if (usedIndexes[index] !== index) {\n\
				usedIndexes.splice(index, 0, index)\n\
				unusedIndexes.push(index)\n\
			}\n\
		}\n\
\n\
		for (; index < children.items.length; index++) {\n\
			unusedIndexes.push(index)\n\
		}\n\
\n\
		for (index = unusedIndexes.length - 1; index >= 0; index--) {\n\
			removeArrayLayer(children.layers[unusedIndexes[index]])\n\
			children.layers.splice(unusedIndexes[index], 1)\n\
			children.items.splice(unusedIndexes[index], 1)\n\
		}\n\
	}\n\
\n\
	function removeArrayLayer(layer) {\n\
		var childrenIndex, layerIndex, elementIndex\n\
\n\
		forEach(layer.children, function (children, childrenIndex) {\n\
			forEach(children.layers, function (layerIndex, layer) {\n\
				removeArrayLayer(layer)\n\
			})\n\
		})\n\
		forEach(layer.anchors, removeElement)\n\
		forEach(layer.elements, function (element, elementIndex) {\n\
			remove(dynamicNodes[layer.state[layer.index]], layer, elementIndex)\n\
		})\n\
	}\n\
\n\
	function createChildren(layer, index) {\n\
		if (typeof layer.children[index] === \'undefined\') {\n\
			layer.children[index] = {\n\
				layers: [],\n\
				items: []\n\
			}\n\
		}\n\
\n\
		return layer.children[index]\n\
	}\n\
\n\
	function findLookaheadNode(lookahead, child) {\n\
		var index\n\
		var lookaheadNode\n\
		var childType = typeof child === \'string\'\n\
			? 3\n\
			: child.length == 2\n\
				? 8\n\
				: 1\n\
\n\
		for (index = 0; index < lookahead.length; index++) {\n\
			lookaheadNode = lookahead[index]\n\
\n\
			if (lookaheadNode.nodeType !== 1 && lookaheadNode.nodeType !== 3) {\n\
				lookahead.splice(index, 1)\n\
				index--\n\
				continue\n\
			}\n\
\n\
			if (\n\
				childType === lookaheadNode.nodeType &&\n\
				(childType !== 1 || lookaheadNode.nodeName.toLowerCase() === child[0])\n\
			) {\n\
				lookahead.splice(index, 1)\n\
\n\
				return lookaheadNode\n\
			} else {\n\
				continue\n\
			}\n\
		}\n\
\n\
		return null\n\
	}\n\
\n\
	' + addIfModule('async ') + 'function createNodes(children, lookahead) {\n\
		var nodes = []\n\
		var index\n\
		var child\n\
		var lookaheadNode\n\
\n\
		for (index = 0; index < children.length; index++) {\n\
			child = children[index]\n\
			lookaheadNode = findLookaheadNode(lookahead, child)\n\
\n\
	    	if (typeof child === \'string\') {\n\
	    		nodes.push(createTextElement(child, lookaheadNode))\n\
	    	} else if (child.nodeType && child.nodeType === 8) {\n\
	    		nodes.push(child)\n\
	    	} else if (child.length == 2) {\n\
	    		nodes.push(createAnchor.apply(null, child))\n\
	    		child[0].lookahead[child[1]] = { 0: lookahead }\n\
	    	} else if (child[0] !== \'!DOCTYPE\') {\n\
	    		var element = ' + addIfModule('await ') + 'createElement(child, lookaheadNode)\n\
	    		nodes.push(element)\n\
	    	}\n\
		}\n\
\n\
		return nodes\n\
	}\n\
\n\
	' + addIfModule('async ') + 'function createElement(child, lookaheadNode) {\n\
		var nodeType = child[0]\n\
		var attributes = child[1]\n\
		var children = child[2]\n\
		var layer = child[3]\n\
		var layerIndex = child[4]\n\
		var index = child[5]\n\
		var element = lookaheadNode || document.createElement(nodeType)\n\
		var nextSibling\n\
		var nodes\n\
\n\
		applyAttributes(element, attributes)\n\
\n\
		if (typeof layer.attributes[layerIndex] === \'undefined\') {\n\
			layer.attributes[layerIndex] = {}\n\
		}\n\
\n\
		layer.attributes[layerIndex][index] = {\n\
			cache: {},\n\
			element: element\n\
		}\n\
\n\
		nextSibling = element.firstChild\n\
		nodes = ' + addIfModule('await ') + 'createNodes(children, layer.lookahead[layerIndex][index] = copy(element.childNodes))\n\
		nodes.forEach(function (child) {\n\
			if (!child.parentNode) {\n\
				if (nextSibling) {\n\
					element.insertBefore(child, nextSibling)\n\
				} else {\n\
					element.appendChild(child)\n\
				}\n\
			} else {\n\
				nextSibling = child.nextSibling\n\
			}\n\
		})\n\
\n\
		return element\n\
	}\n\
\n\
	function createTextElement(content, lookaheadNode) {\n\
		var value = content\n\
\n\
		if (String(content).indexOf(\'&\') !== -1) {\n\
			avatarTextarea.innerHTML = content\n\
			value = avatarTextarea.value\n\
		}\n\
\n\
		if (lookaheadNode !== null) {\n\
			lookaheadNode.nodeValue = value\n\
\n\
			return lookaheadNode\n\
		}\n\
\n\
		return document.createTextNode(value)\n\
	}\n\
\n\
	function createAnchor(layer, index) {\n\
		var anchor = document.createComment(index)\n\
\n\
		layer.anchors[index] = anchor\n\
\n\
		return anchor\n\
	}\n\
\n\
	function applyAttributes(element, attributes) {\n\
		forEach(attributes, function (value, attribute) {\n\
			element.setAttribute(attribute, value)\n\
		})\n\
	}\n\
\n\
	function handleAttributes(layerAttributes, attributes) {\n\
		forEach(attributes, function (value, attribute) {\n\
			if (booleanAttributes.indexOf(attribute) !== -1) {\n\
				layerAttributes.element[attribute] = value\n\
			} else {\n\
				layerAttributes.element.setAttribute(attribute, value)\n\
			}\n\
\n\
			layerAttributes.cache[attribute] = true\n\
		})\n\
\n\
		forEach(layerAttributes.cache, function (value, attribute) {\n\
			if (typeof attributes[attribute] === \'undefined\') {\n\
				layerAttributes.element.removeAttribute(attribute)\n\
				delete attributes[attribute]\n\
			}\n\
		})\n\
	}\n\
\n\
	function handleTextNode(layer, index, content) {\n\
		if (typeof layer.textCache[index] !== \'undefined\' && layer.textCache[index] !== content) {\n\
			remove(TEXT_NODE, layer, index)\n\
		}\n\
\n\
		if (typeof layer.textCache[index] === \'undefined\' || layer.textCache[index] !== content) {\n\
			layer.elements[index] = createElementsFromContent(String(content))\n\
			insertLayerElements(layer, index)\n\
			layer.textCache[index] = content\n\
		}\n\
	}\n\
\n\
	function createElementsFromContent(content) {\n\
		if (content.indexOf(\'<\') !== -1 || content.indexOf(\'&\') !== -1) {\n\
			avatarDiv.innerHTML = content\n\
\n\
			return copy(avatarDiv.childNodes)\n\
		}\n\
\n\
		return [createTextElement(content, null)]\n\
	}\n\
\n\
	function insertLayerElements(layer, index) {\n\
		var previousSibling = layer.anchors[index]\n\
\n\
		layer.elements[index].forEach(function (element) {\n\
			if (!element.parentNode || element.parentNode !== document || previousSibling && element.previousSibling !== previousSibling) {\n\
				insertAfter(element, previousSibling)\n\
			}\n\
\n\
			if (element.parentNode && element.parentNode !== document) {\n\
				previousSibling = element\n\
			}\n\
		})\n\
	}\n\
\n\
	function insertElement(layer, index, element) {\n\
		if (layer.anchors[index]) {\n\
			insertBefore(layer.anchors[index].parentNode, element, layer.anchors[index])\n\
		} else {\n\
			mountNode.appendChild(element)\n\
\n\
			if (rootElements.indexOf(element) === -1) {\n\
				rootElements.push(element)\n\
			}\n\
		}\n\
	}\n\
\n\
	function insertAfter(element, anchor) {\n\
		var parent = mountNode\n\
\n\
		if (anchor) {\n\
			parent = anchor.parentNode\n\
		} else if (rootElements.indexOf(element) === -1) {\n\
			rootElements.push(element)\n\
		}\n\
\n\
		if (anchor && anchor.nextSibling) {\n\
			insertBefore(parent, element, anchor.nextSibling)\n\
		} else if (parent !== document || element.nodeType === 8)  {\n\
			parent.appendChild(element)\n\
		}\n\
	}\n\
\n\
	function insertBefore(parent, element, anchorRef) {\n\
		if (parent !== document || element.nodeType !== 3) parent.insertBefore(element, anchorRef)\n\
\n\
		if (parent === mountNode && rootElements.indexOf(element) === -1) {\n\
			rootElements.push(element)\n\
		}\n\
	}\n\
\n\
	function removeElement(element) {\n\
		if (element.parentNode !== null) {\n\
			element.parentNode.removeChild(element)\n\
		}\n\
	}\n\
\n\
	function remove(type, layer, index) {\n\
		switch (type) {\n\
			case ARRAY: \n\
				var layerIndex, elementIndex, element \n\
\n\
				forEach(layer.children[index].layers, function (sublayer) {\n\
					forEach(layer.elements, removeElement)\n\
				})\n\
\n\
				delete layer.children[index]\n\
				break\n\
			case EXECUTE:\n\
				break\n\
			case TEXT_NODE:\n\
				delete layer.textCache[index]\n\
			default:\n\
				layer.elements[index].forEach(removeElement)\n\
				delete layer.elements[index]\n\
\n\
				if (type === COMPONENT) {\n\
					delete layer.components[index]\n\
				}\n\
		}\n\
	}\n\
\n\
	' + addIfModule('async ') + 'function handleTemplate(instructionIndex, layer) {\n\
		layer.index++\n\
\n\
		if (layer.index >= layer.state.length || instructionIndex < layer.state[layer.index]) {\n\
			layer.state.splice(layer.index, 0, instructionIndex)\n\
			' + addIfModule('await ') + 'instructions[instructionIndex](layer)\n\
		} else if (instructionIndex > layer.state[layer.index]) {\n\
			remove(dynamicNodes[layer.state[layer.index]], layer, layer.state[layer.index])\n\
			layer.state.splice(layer.index, 1)\n\
			layer.index--\n\
			handleTemplate(instructionIndex, layer)\n\
		} else if (typeof dynamicNodes[instructionIndex] !== \'undefined\') {\n\
			instructions[instructionIndex](layer)\n\
		}\n\
\n\
	}\n\
\n\
	function handleTail(layer) {\n\
		layer.index++\n\
\n\
		for (; layer.index < layer.state.length;) {\n\
			remove(dynamicNodes[layer.state[layer.index]], layer, layer.state[layer.index])\n\
			layer.state.splice(layer.index, 1)\n\
		}\n\
	}\n\
\n\
	' + addIfModule('async ') + 'function removeLookahead(layer) {\n\
		' + addIfModule('await ') + 'forEach(layer.lookahead, ' + addIfModule('async ') + 'function (lookaheads) {\n\
			' + addIfModule('await ') + 'forEach(lookaheads, ' + addIfModule('async ') + 'function (lookahead) {\n\
				' + addIfModule('await ') + 'forEach(lookahead, removeElement)\n\
\n\
				lookahead.splice(0, lookahead.length)\n\
			})\n\
		})\n\
\n\
		' + addIfModule('await ') + 'forEach(layer.children, ' + addIfModule('async ') + 'function (children) {\n\
			' + addIfModule('await ') + 'forEach(children.layers, removeLookahead)\n\
		})\n\
	}\n\
\n\
	if (typeof templates[0] !== \'undefined\' && typeof layers[0] !== \'undefined\') {\n\
		' + addIfModule('var componentNames = Object.keys(imports)\n\
		var modules = ' + addIfModule('await ') + 'Promise.all(Object.values(imports))\n\
\n\
		imports = modules.map(function (module) { return module.default })\n\
			.reduce(function (result, module, index) {\n\
				result[componentNames[index]] = module\n\
				return result\n\
			}, {})\n\
		') + '\n\
		layers[0].lookahead[0] = { 0: lookahead ? lookahead : copy(mountNode.childNodes) }\n\
		' + addIfModule('await ') + 'templates[0](layers[0])\n\
		removeLookahead(layers[0])\n\
	}\n\
\n\
	function setState(data) {\n\
		if (arguments.length === 2) {\n\
			scope = data\n\
			state = arguments[1]\n\
		} else {\n\
			scope = {}\n\
			state = data\n\
		}\n\
\n\
		if (typeof templates[0] !== \'undefined\' && typeof layers[0] !== \'undefined\') {\n\
			templates[0](layers[0])\n\
		}\n\
\n\
		return rootElements\n\
	}\n\
\n\
	if (arguments.length === 2) {\n\
		return setState\n\
	} else {\n\
		return { setState: setState, elements: rootElements }\n\
	}\n\
}\n\
' + addIfModule('export default main', 'module.exports = main')
}
