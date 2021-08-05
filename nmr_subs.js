/*
The MIT License (MIT)
Copyright © 2021 Gounaman
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/* SUBROUTINES */


function slide() {
	const el1 = document.getElementById("slider");

	if (_Globals.previouslyToggled === 0) {
		el1.setAttribute("style", "visibility:visible");
	} else {
		el1.setAttribute("style", "visibility:hidden");
	}

	_Globals.previouslyToggled === 1 ?
		(_Globals.previouslyToggled = 0) : (_Globals.previouslyToggled = 1);

	return true;
}

function showInfo() {
	let infoEl = document.getElementById("infoID");
	(window.getComputedStyle(infoEl).visibility === "hidden") ?
		infoEl.style.visibility = "visible" :
		infoEl.style.visibility = "hidden";
}

function convertOperators(str) {

	const operators = ['÷', '×', '−']
	const o_array = ["/", "*", "-"]

	str = str.replaceAll(o_array[0], operators[0]);
	str = str.replaceAll(o_array[1], operators[1]);
	str = str.replaceAll(o_array[2], operators[2]);

	return str;

}

function getByID(val) {
	let el = document.getElementById(val);
	if (el === null) return false;
	return el;
};

function getByClass(val) {
	let el = document.getElementsByClassName(val);
	if (el === null) return false;
	return el;
};

function toggleKeypad() {

	_nmr[1].textContent = "٠";
	_nmr[2].textContent = "0";

	if (isArabic()) {
		_Globals.pct.textContent = "%"
		_nmr[3].style.direction = "ltr";
		_nmr[3].textContent = 'Ready';
		_nmr[4].style.direction = "ltr";
		_nmr[4].textContent = "Reserved for future use...";
		switch2Afrangi(_Globals.numericKeys)
		resetLanguage();
	} else {
		_Globals.pct.textContent = "٪"
		_nmr[3].style.direction = "rtl";
		_nmr[3].textContent = 'جاهز';
		_nmr[4].style.direction = "rtl";
		_nmr[4].textContent = "محجوز للمستقبل...";
		switch2Arabic(_Globals.numericKeys);
		resetLanguage();
	}

	if (!isFirstIteration()) resetFirstIteration();
	tokenizer.clearAll();
	return true;
}

function handleNumeral(ev) {

	let token = ev.textContent;
	let token_type = ev.className;
	let res = null;

	if (isArabic()) {
		token = mapper.get(token);
	}

	if (isFirstIteration()) {
		clear1and2();
		resetFirstIteration();
		res = tokenizer.addToken(token, token_type);
		if (res === false) {
			resetFirstIteration();
			reset();
			return;
		}
	} else {
		res = updateTokenizer(token, token_type);
		if (res === false) {
			reset();
			return;
		}
	}

	updateCalculator(token, token_type);
}

function handleOperator(ev) {

	let token = ev.id;
	let token_type = ev.className;
	let result = null;

	if (token === tokenizer.getPreviousToken) {
		if (isArabic()) {
			_nmr[3].textContent = "مكرر" + " " + token;
		} else {
			_nmr[3].textContent = "Duplicate" + " " + token;
		}
		return;
	}

	res = tokenizer.addToken(token, token_type);
	if (res === false) {
		handleDelete();
		return;
	}

	res = updateCalculator(token, token_type);
	if (res === false) {
		return false;
	}

}

function handlePlusMinus() {

	const row = tokenizer.rowCount - 1;
	let newVal = tokenizer.removeTokenAt(row, 0);
	const token_type = tokenizer.getPreviousTokenType;

	newVal = performNegation(newVal);
	tokenizer.addTokenAt(newVal, row);
	tokenizer.updatePreviousToken(newVal, token_type)
	const res = updateCalculator(newVal, token_type);
	if (res === false) return false;

}

function updateCalculator(token, token_type) {

	let tmp = null;
	let tmp2 = null;
	let str = tokenizer.stringify();
	let str2 = null;

	// convert operators to keypad representation

	if (tokenizer.buffSz) {
		str = convertOperators(str);
	}

	// convert to Arabic expression

	str2 = translateTo(str);

	_nmr[1].textContent = str2;
	_nmr[2].textContent = str;

	if (tokenizer.getPreviousTokenType === "operator") {
		_nmr[3].textContent = "Incomplete expression";
		return true;
	}

	tmp = tokenizer.calculate();
	if (tmp === false) return false;

	if (tmp > 999) {
		tmp2 = numberWithCommas(tmp);
	}

	if (isArabic()) {
		_nmr[3].textContent = _Globals.intl.format(tmp);
	} else {
		(tmp > 999) ? _nmr[3].textContent = tmp2 :
			_nmr[3].textContent = tmp;
	}

	return true;

}

function translateTo(str) {

	let str2 = "";
	let tmp = null;

	for (let i = 0; i < str.length; i++) {
		if (_Globals.arr.includes(str[i])) {
			tmp = translater[str[i]];
			str2 += tmp;
		}
		else str2 += str[i];
	}

	return str2;
}

function updateTokenizer(token, type) {

	let parse_decision = null;
	let result = null;

	parse_decision = tokenizer.addOrExpand(type);

	if (parse_decision === false) return false;

	if (parse_decision === "add") {
		result = tokenizer.addToken(token, type);
	}

	if (parse_decision === "expand") {
		result = tokenizer.expandCurrentRow(token, type);
	}

	return result;

}

function switch2Afrangi(val) {

	const layout = ["1", "4", "7", "2", "5", "8", "0", "3", "6", "9"];

	for (var i = 0; i < 10; i++) {
		val[i].textContent = layout[i];
	}

	_nmr[5].textContent = ".";
}

function switch2Arabic(val) {

	const layout = ["۳", "٦", "٩", "۲", "٥", "٨", "٠", "۱", "٤", "٧"];

	for (var i = 0; i < 10; i++) {
		val[i].textContent = layout[i];
	}

	_nmr[5].textContent = "٫";

}

function clear1and2() {
	_nmr[1].textContent = null;
	_nmr[2].textContent = null;
}

function numberWithCommas(str) {

	return (str).toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 15 });

}

function performNegation(num) {

	if (num >= 0) {
		return -num;
	}
	else {
		return Math.abs(num);
	}

}

function handleDecimal(ev) {

	let res = null;

	let token = ev.textContent;
	let token_type = ev.className;

	res = tokenizer.handleDecimal(token, token_type);

	if (res === false) {
		reset();
		return;
	}

	res = updateCalculator(token, token_type);

	if (res === false) {
		reset();
		return;
	}

}

function reset() {

	_nmr[1].textContent = "٠";
	_nmr[2].textContent = 0;

	if (isArabic()) {
		_nmr[3].textContent = "جاهز";
	} else {
		_nmr[3].textContent = "Ready";
	}

}

function handleDelete() {

	if (!tokenizer.buffSz) return false;

	let res = tokenizer.delete();
	if (res === false) { return false; }

	if (tokenizer.getPreviousToken === null) {
		reset();
		return true;

	}

	res = _nmr[1].textContent;
	res = res.substr(0, res.length - 1);
	if (res.slice(-1) === " ") {
		res = res.substr(0, res.length - 1);
	}
	if (res === "") {
		_nmr[1].textContent = "٠";
		return true; // debug field 3?
	} else {
		_nmr[1].textContent = res;
	}

	res = _nmr[2].textContent;
	res = res.substr(0, res.length - 1);
	if (res.slice(-1) === " ") {
		res = res.substr(0, res.length - 1);
	}
	if (res === "") {
		_nmr[2].textContent = "0";
		return true; // debug field 3?
	} else {
		_nmr[2].textContent = res;
	}

	if (tokenizer.getPreviousTokenType === "operator") {
		_nmr[3].textContent = "Incomplete expression"; // debug arabic version
		return true;
	}

	res = performDelCalculation();
	if (res == - true) { return true; } else return false;

}

function performDelCalculation() {

	if (tokenizer.getPreviousToken === false) {
		if (isArabic()) {
			_nmr[3].textContent = "جاهز";
		}
		else { _nmr[3].textContent = "Ready"; }
		_nmr[1].textContent = "٠";
		return true;
	}

	const tmp = tokenizer.calculate();

	if (tmp === false) return false;

	if (tmp > 999) {
		const tmp2 = numberWithCommas(tmp);
	}

	if (isArabic()) {
		_nmr[3].textContent = _Globals.intl.format(tmp);
	} else {
		(tmp > 999) ? _nmr[3].textContent = tmp2 :
			_nmr[3].textContent = tmp;
	}

	return true;
}

function handleClear() {

	tokenizer.clearAll();
	reset();
	return true;

}

function handlePercent() {

	const res = tokenizer.percent();
	if (res === false) return false;
	_nmr[1].textContent = _Globals.intl.format(res);
	//_nmr[2].textContent = res;
	if (isArabic()) {
		_nmr[3].textContent = _Globals.intl.format(res);
	} else {
		_nmr[3].textContent = res;
	}


}

function copyExpr(el) {

	const content = _nmr[el].textContent;

	navigator.clipboard.writeText(content)
		.then(() => {
			return true
		})
		.catch(err => {
			console.log('Clipboard operation unsuccessful', err);
			return false;
		})
}

// EOF
