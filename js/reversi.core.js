"use strict";

// ライブラリ用のオブジェクトの作成
if (window.reversi === undefined) {window.reversi = {}}
if (window.reversi.core === undefined) {window.reversi.core = {}}

(function() {
	var _t = reversi.core;		// ショートカットの作成
	var _snd = resouce.sound;	// ショートカットの準備

	// 同レベルのライブラリは初期化時にショートカットを作成
	var _rvs = null;	// ショートカットの準備
	var _rc = null;		// ショートカットの準備
	var _re = null;		// ショートカットの準備

	// 変数の初期化
	_t.lck = false;	// クリックのロック

	// 初期化
	_t.init = function() {
		_rvs = reversi.reversi;	// ショートカットの作成
		_rc = reversi.canvas;	// ショートカットの作成
		_re = reversi.effect;	// ショートカットの作成

		var r = [];
		r.push(resouce.image.load("bg",    "img/bg.png"));
		r.push(resouce.image.load("_tkn0", "img/token0.png"));
		r.push(resouce.image.load("_tkn1", "img/token1.png"));
		r.push(resouce.sound.load("se0",   "snd/se0", "se"));
		r.push(resouce.sound.load("se1",   "snd/se1", "se"));
		r.push(resouce.sound.load("bgm0",  "snd/bgm0"));
		r.push(resouce.sound.load("bgm1",  "snd/bgm1"));
		r.push(resouce.sound.load("win",   "snd/win"));
		r.push(resouce.sound.load("lose",  "snd/lose"));
		r.push(resouce.font.load("serif ", "ArchivoBlack, serif"));

		$.when.apply($, r).then(function() {
			_rc.initCnvs();		// キャンバスの初期化
			_rc.rszTkn();		// 石のリサイズ
			_re.init();			// エフェクト初期化
			_t.initClck();		// クリック初期化
			_t.strt();			// 開始
			game.anim.strt();	// アニメーション開始
			game.anim.add("updtCnvs", function() {
				_t.updtCnvs(false);		// キャンバス更新
			});
			game.ui.init(_rc.c,
				{fntFmly: "ArchivoBlack"});	// UI初期化

			// 開始表示
			_t.lck = true;			// クリックのロック
			_t.btnStrt("Start");	// 開始ボタン
//			_snd.playBGM("bgm1");	// 2020-05-11

			//test.sound.plyBGM();	// サウンド テスト
			//test.anim.tst1();		// アニメーション テスト
		});
	};

	// 開始
	_t.strt = function() {
		_rvs.init();		// 盤面初期化
		_t.updtCnvs(true);	// キャンバス更新
		_t.lck = false;		// クリックのロック解除
//		_snd.playBGM("bgm0");	// 2020-05-11
	};

	// キャンバス更新
	_t.updtCnvs = function(needUpdt) {
		if (needUpdt) {
			// 再描画必要
			_rc.drwBg();				// 背景描画
			_rc.drwSqAll();				// 盤面全描画
			_rc.drwTknAll(_rvs.brd);	// 全石描画
			_rc.drwEnblSqsAll();		// 配置可能マスの全描画
			_rc.drwPScrAll();			// 全スコア描画
			_rc.drwPlyr();				// 手番プレイヤー描画
			_rc.genCsh();				// キャッシュの作成
		} else {
			// 再描画不要（キャッシュ利用）
			_rc.drwCsh();				// キャッシュの描画
		}
	};

	// 開始ボタン
	_t.btnStrt = function(txt) {
		var nm = "btnStrt";
		var w = _rc.c.w;
		var h = _rc.c.h;
		var bW = _rc.l.sqSz * 4 * 1.2;
		var bH = _rc.l.sqSz * 1.3;
		var bX = (w - bW) / 2;
		var bY = (h - bH) / 2;

		game.ui.addBtn(nm, txt, bX, bY, bW, bH, function() {
			game.ui.rmvBtn(nm);
			_t.strt();	// 開始
			_snd.playBGM("bgm0");	// 2020-05-11
		});
	};

	// クリック初期化
	_t.initClck = function() {
		var c = _rc.c;
		var l = _rc.l;
		var rng = game.core.inRng;

		$(c.cnvs).click(function(e) {
			var x = e.offsetX * game.canvas.scl;
			var y = e.offsetY * game.canvas.scl;

			// 盤面内か確認
			if (! rng(x, y, l.brdX, l.brdY, l.brdW, l.brdH)) {return}

			// 何マス目か計算
			var sqX = ((x - l.brdX) / l.sqSz) | 0;
			var sqY = ((y - l.brdY) / l.sqSz) | 0;
			_t.clckBrd(sqX, sqY);
		});
	};

	// 盤面クリック時の処理
	_t.clckBrd = function(x, y) {
		// ロック時、COM時は飛ばす
		if (_t.lck) {return}
		if (_rvs.getPTyp() == _rvs.PTYP.com) {return}

		// 石置き処理
		var res = _rvs.putTkn(x, y);
		if (res) {
			_t.lck = true;	// ロック
			_t.doRev();		// 裏返し処理
		}
	};

	// 裏返し処理
	_t.doRev = function() {
		_snd.playSE("se0");
		_re.putTkn().then(function() {
			_t.playSERev();		// 裏返りSE
			return _re.chngBrd();
		}).then(function() {
			_t.updt();
		});
	};

	// 裏返しSE
	_t.playSERev = function() {
		var max = _rvs.revTkns.length;
		if (max > _snd.seMax) {max = _snd.seMax}
		for (var i = 0; i < max; i ++) {
			setTimeout(function() {
				_snd.playSE("se1");
			}, 50 * i);
		}
	};

	// 更新
	_t.updt = function() {
		_t.updtCnvs(true);	// キャンバス更新

		// 終了判定
		if (_rvs.isEnd) {
			// 結果計算
			var msg = "LOSE", bgm = "lose";
			if (_rvs.scr[0] >  _rvs.scr[1]) {msg = "WIN"; bgm = "win"}
			if (_rvs.scr[0] == _rvs.scr[1]) {msg = "DRAW"}

			// エフェクト
			_re.msg("END").then(function() {
				// 終了時サウンド
				_snd.playBGM(bgm, function() {
					_snd.playBGM("bgm1");
					_t.btnStrt("Start");	// 開始ボタン
				});
				_re.msg(msg);
			});
			return;
		}

		// スキップが必要か確認
		if (_rvs.enblSqs.length == 0) {
			_re.msg("SKIP").then(function() {
				_rvs.skp();
				_t.updt();
			});
			return;
		}

		// COMか確認
		if (_rvs.getPTyp() == _rvs.PTYP.com) {
			setTimeout(function() {
				// 石置き処理
				var put = reversi.com.get();
				_rvs.putTkn(put.x, put.y);
				_t.doRev();		// 裏返し処理
			}, 250);
			return;
		}

		// スキップやCOMがなければロック解除
		_t.lck = false;
	};

})();
