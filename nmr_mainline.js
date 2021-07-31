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

/* MAINLINE */

/* INIT */

const currentState = function () {

	let current = true;
	let get = () => current;
	let set = () => {
		if (current) {
			current = false;
		} else {
			current = true;
		}
		return true;
	}

	return [get, set];

}

const [isArabic, resetLanguage] = currentState();
const [isFirstIteration, resetFirstIteration] = currentState();

const translater = {
	0: '\u0660',
	1: '\u0661',
	2: '\u0662',
	3: '\u0663',
	4: '\u0664',
	5: '\u0665',
	6: '\u0666',
	7: '\u0667',
	8: '\u0668',
	9: '\u0669',
	'.': '٫'
}

Object.freeze(translater);

const mapper = new Map([
	["٠", 0],
	["۱", 1],
	["۲", 2],
	["۳", 3],
	["٤", 4],
	['٥', 5],
	['٦', 6],
	['٧', 7],
	['٨', 8],
	['٩', 9]
]);

Object.freeze(mapper);

const _nmr = (function () {

	let els = ["nimra",
		"expression",
		"translation",
		"result",
		"infoID",
		"decimal"];
	let pointers = [];
	let i = 0;

	while (i < els.length) {
		pointers[i] = getByID(els[i]);
		i++;
	}

	return pointers;

}());


const _Globals = {
	intl: Intl.NumberFormat('ar-EG'),
	pct: document.querySelector("#percent"),
	numericKeys: getByClass("numeral"),
	space: '\u0020',
	arr: Object.keys(translater)
}

const tokenizer = new Tokenizer();
_nmr[0].addEventListener("click", getClickedID);

/* MAIN LOOP */

function getClickedID(event) {

	const ev = event.target;

	if (ev.id === "tog") {
		toggleKeypad();
	}

	if (ev.className === "numeral") {
		handleNumeral(ev);
	}

	if (ev.className === "operator") {

		if (tokenizer.buffSz === false) {
			isArabic() === true ?
				_nmr[3].textContent = "حاول كمان مرة" :
				_nmr[3].textContent = "Try again";
			return;
		}

		handleOperator(ev);

	}

	if (ev.className === "dec") {

		const rowArr = tokenizer.getCurrRowValues;

		if (rowArr != false) {

			const rowlen = rowArr.length;
			let i = 0;
			let dup_flag = 0;

			while (i <= rowlen) {

				if (dup_flag > 0) {
					if ((ev.textContent === ".") || (ev.textContent === "٫")) {
						if (isArabic()) {
							_nmr[3].textContent = "عامل مكرر";
						} else {
							_nmr[3].textContent = "Duplicate operator";
						}
						return;
					}
				}

				if (i === rowlen) break;

				if (rowArr[i] === ".") {
					dup_flag++;
				}
				i++;

			}
		}

		handleDecimal(ev);

	}

	if (ev.className === "func") {

		if (ev.id === "plusmin") {
			if (tokenizer.buffSz) handlePlusMinus();
			return;
		}

		if (ev.id === "deltxt") {

			handleDelete();
			return;
		}

		if (ev.id === "clrtxt") {

			handleClear();
			return;
		}

		if (ev.id === "percent") {

			handlePercent();
			return;
		}


	}
}



//EOF
