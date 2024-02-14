"use strict";

// ライブラリ用のオブジェクトの作成
if (window.resouce === undefined) {window.resouce = {}}
if (window.resouce.font === undefined) {window.resouce.font = {}}

// 注意：Firefoxでは、ローカルではWebフォントを読み込めない。

(function() {
	var _t = resouce.font;	// ショートカットの作成

	// 変数の初期化

	// フォントの読み込み
	_t.load = function(f1, f2) {
		var d = $.Deferred();
		var c = game.canvas.genCnvs(1, 1);
		var tryCnt = 0;
		var tryMax = 30;
		var chckTxt = "abcdefg";
		var fntNm = f1.length > f2.length ? f1 : f2;

		$('body').append(c.$cnvs);	// IE対策

		var fnc = function() {
			if (tryCnt ++ >= tryMax) {
				var msg = "err fnt : " + fntNm;
				console.log(msg);
				d.resolve(msg);
				return;
			}

			c.cntx.font = "32px " + f1;
			var mt1 = c.cntx.measureText(chckTxt).width;

			c.cntx.font = "32px " + f2;
			var mt2 = c.cntx.measureText(chckTxt).width;

			console.log("fnt compare", mt1, mt2);

			if (mt1 != mt2) {
				var msg = "load fnt : " + fntNm;
				console.log(msg);
				d.resolve(msg);
				c.$cnvs.remove();   // IE対策
				return;
			}

			setTimeout(fnc, 100);
		};
		fnc();

		return d.promise();
	};

})();

