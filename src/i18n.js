import { useEffect } from 'react'
const D = {
'Namba ·':'難波 ·','House':'おうち','Mugi':'ムギ','Mizu':'ミズ','Play':'再生','Pause':'一時停止','Say':'言う','Remember':'覚える','Cancel':'やめる','Dance':'ダンス','Wave':'手をふる','Feed':'ごはん','Hum':'ハミング','Listen':'聞く',
'Morning':'朝','Evening':'夕方','Night':'夜','Afternoon':'昼',
'Tap the bell. They both come.':'ベルをタップ。ふたりとも来るよ。','Lights down':'消灯','They\'re up.':'起きたよ。','Both of them. Right here.':'ふたりとも、ここにいるよ。',
"Hum it on Mugi's page first. They'll share it.":'まずムギのページでハミングしてね。ふたりで聞くよ。','Her tune. Both of them know it.':'あの子の歌。ふたりとも知ってるよ。',
'Tap Play again so the phone allows it.':'もう一度「再生」をタップしてね。','Lights down. Tap the room to wake them.':'おやすみ。部屋をタップで起こしてね。',
'The window cleared.':'窓が晴れたよ。','Rain on the glass.':'窓に雨。','Stop the rain':'雨をやめる','Rain':'雨','Wake them':'起こす','Goodnight':'おやすみ',
'Bell':'ベル','Noren':'のれん','Rice cooker':'炊飯器','Kettle':'やかん',"Kettle's on.":'お湯をわかしてるよ。','Takoyaki':'たこ焼き','Takoyaki. She wants one.':'たこ焼き。ムギも食べたいって。',
'Hum a tune with Mugi and they’ll share it.':'ムギと歌をハミングすると、ふたりで聞けるよ。','Noren. 難波.':'のれん。難波。',
"It's dark. She sniffs it anyway.":'暗いね。それでもクンクン。','Something bright. She squints and wags.':'まぶしい何か。目を細めてしっぽふりふり。','Something grey. She tilts her head.':'灰色の何か。首をかしげてる。',
'Something red. Is it a ball?':'赤い何か。ボールかな？','Something orange. She thinks it might be a snack.':'オレンジの何か。おやつかもって。','Something yellow. Her tail goes.':'黄色い何か。しっぽが動いた。',
'Something green. Grass? She wants to roll in it.':'緑の何か。草？ころがりたいって。',"Something blue-green. She thinks it's Mizu's water.":'青緑の何か。ミズの水だと思ってる。',
'Something blue. She stares at it.':'青い何か。じっと見てる。','Something purple. Very fancy.':'紫の何か。おしゃれ。','Something pink. Her favourite.':'ピンクの何か。大好きな色。',
'Pinch her back. Tap her. Drag the ball.':'ピンチで遠ざけて。タップしてね。ボールをドラッグ。',"She's here.":'来たよ。',"I'm here.":'ここだよ。',"She's coming.":'来てるよ。',
'The dance she learned.':'覚えたダンス。','She only knows a little spin so far.':'まだ小さなくるりんだけ。','Hum it first. A few seconds is enough.':'先にハミングしてね。数秒でいいよ。',
"The camera isn't ready.":'カメラの準備中。',"She's looking…":'見てるよ…','She lost the picture. Try again.':'見失っちゃった。もう一回。','Camera off.':'カメラ オフ。',
"You're both looking. Ask her what it is.":'いっしょに見てるよ。「これなに？」って聞いてね。','The camera needs a yes.':'カメラを許可してね。','Her tune. Head move.':'あの子の歌。頭ゆらゆら。',
'Tap Play again so the phone allows the sound.':'音を出すにはもう一度「再生」をタップ。','Paused.':'一時停止。',"This phone can't record. Type APT and she'll still nod.":'録音できないよ。APTと入力すればうなずくよ。',
'That was too short. Hum a little longer.':'短すぎたよ。もう少し長くハミングしてね。','Hum it. Six seconds, then she uses that.':'ハミングしてね。6秒で覚えるよ。','The microphone needs a yes.':'マイクを許可してね。',
"This phone won't listen. Type it instead.":'聞き取れない端末だよ。入力してね。',"She didn't catch that.":'聞き取れなかったよ。','Listening…':'聞いてるよ…','Right there.':'そこそこ。',
'She chased it.':'追いかけたよ。','She got the ball.':'ボールとった。','Tap her name to call her':'名前をタップで呼んでね','Stop the camera':'カメラを止める','Look together':'いっしょに見る',
'Sound on':'音オン','Sound off':'音オフ',"This move didn't load. Try another.":'この動きは読み込めなかったよ。別のを試してね。','Ball':'ボール','Mugi the corgi':'コーギーのムギ',
'Ask what you both see':'いっしょに見てるものを聞く','Read this, or say dance':'読ませる、または「ダンス」','Say something to Mugi':'ムギに話しかける','Looking…':'見てるよ…','What is it?':'これなに？',
"She'll remember that dance.":'このダンス、覚えたよ。','Nothing new. She still knows the old one.':'新しくないね。前のを覚えてるよ。','Tap moves in order. Then remember.':'動きを順番にタップ。それから「覚える」。',
'Teach a new dance':'新しいダンスを教える','Teach a dance':'ダンスを教える',
'Look':'見る','Trot':'足ぶみ','Zoom':'ダッシュ','Sit':'おすわり','Roll':'ごろん','Ears, a glance, a wag.':'耳、ちらっ、しっぽふりふり。','Steps in place.':'その場で足ぶみ。',
'One fast circle, then a stop.':'すばやく一周して、ストップ。','Sits and offers a paw.':'おすわりして、お手。','Onto her back, then up.':'ごろんとして、起き上がる。',
'Pink':'ピンク','Gold':'ゴールド','Wild':'野生色','Dark':'ブラック','Leucistic. The pink one.':'リューシスティック。ピンクの子。','Golden albino.':'ゴールデンアルビノ。','Wild type.':'野生型。','Melanoid. Almost black.':'メラノイド。ほぼ黒。',
'Drag her. Tap the plant, the stone, or a bubble.':'ドラッグしてね。水草、石、あわをタップ。','Tap her. Drag her. Try the plant, the stone, or a bubble.':'タップしたり、ドラッグしてね。水草、石、あわもためして。',
'She smiled at you.':'ニコッてしたよ。','A happy wiggle!':'うれしくてくねくね！','Gills all fluffy. She likes that.':'エラがふわふわ。うれしいみたい。','She did a little spin.':'くるっと回ったよ。','Tickles! She wiggles away.':'くすぐったい！くねくね逃げたよ。','She loves you, Rie. 💕':'りえちゃん大好きだって。💕',
'Rice is ready.':'ご飯できたよ。',"She's at the glass.":'ガラスのところに来たよ。','Gills up.':'エラぴん。','Dinner time. A pellet drops.':'ごはんの時間。エサが落ちるよ。',
'She found it.':'見つけたよ。','Behind the stone.':'石のうしろ。','Lights down. She rests.':'消灯。おやすみ中。','Lights up.':'明かりがついたよ。','Quiet bubbles. They stay on this phone.':'静かなあわ。このスマホの中だけ。',
'Back of the tank.':'水槽のおく。','Closer to the glass.':'ガラスの近く。','She swam over.':'泳いできたよ。','Lights on':'明かりをつける','Lights off':'明かりを消す','Bubbles off':'あわオフ','Bubbles on':'あわオン',
'Sparkly clean! Mizu does a happy wiggle. ✨':'ピカピカ！ミズがうれしくてくねくね。✨','Plant':'水草','In the plants.':'水草の中。','Stone':'石','Bubble':'あわ','Pop.':'パチン。',
'Read this, or say wave':'読ませる、または「手をふる」','Say something to Mizu':'ミズに話しかける','Tap her name. She comes to the glass.':'名前をタップ。ガラスまで来るよ。','Rooms':'へや',
}
const R = [[/^Namba · (.+)$/, (m, a) => '難波 · ' + (D[a] ?? a)], [/^Learning: (.+)$/, (m, a) => '練習中：' + a.split(', ').map(x => D[x] ?? x).join('、')],
  [/^Still (\w+)\. She.*$/, () => 'まだ同じ色。じっと見てる。']]
export const tr = s => { const k = s.trim(); if (!k) return s; if (D[k]) return s.replace(k, D[k]); for (const [re, f] of R) if (re.test(k)) return k.replace(re, f); return s }
const ATTR = ['title', 'aria-label', 'placeholder', 'alt']
function walk(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n
  while ((n = w.nextNode())) { const t = tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t }
  root.querySelectorAll?.('*').forEach(el => ATTR.forEach(a => { const v = el.getAttribute(a); if (v) { const t = tr(v); if (t !== v) el.setAttribute(a, t) } }))
}
export function useJaDom(ref, on) {
  useEffect(() => {
    const el = ref.current; if (!on || !el) return
    walk(el)
    const mo = new MutationObserver(ms => { mo.disconnect(); ms.forEach(m => walk(m.target.nodeType === 3 ? m.target.parentNode : m.target)); mo.observe(el, opts) })
    const opts = { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTR }
    mo.observe(el, opts); return () => mo.disconnect()
  }, [on])
}
