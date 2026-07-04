#!/usr/bin/env python3
"""オタスケAI Smart Call 業界別提案資料（.pptx）を生成する。
使い方: python3 tools/build_smartcall_pptx.py
出力:  tools/オタスケAI_SmartCall_業界別提案資料.pptx
編集可能なPowerPointファイル（16:9）。数字・文言はスライド上で直接直せる。
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

# ---- パレット（HTML版と統一） ----
INK    = RGBColor(0x22, 0x28, 0x2E)
MUTED  = RGBColor(0x5F, 0x6B, 0x73)
BRAND  = RGBColor(0x2F, 0x5D, 0x8A)
GOOD   = RGBColor(0x1F, 0x7A, 0x52)
PAPER  = RGBColor(0xF5, 0xF3, 0xEE)
CARD   = RGBColor(0xFF, 0xFF, 0xFF)
FIELD  = RGBColor(0xF3, 0xF1, 0xEA)
LINE   = RGBColor(0xD9, 0xD3, 0xC7)
WHITE  = RGBColor(0xFF, 0xFF, 0xFF)
WARN_BG= RGBColor(0xF6, 0xEF, 0xDA)
WARN_IN= RGBColor(0x7A, 0x5C, 0x12)
PAIN   = RGBColor(0xC0, 0x66, 0x2A)
FONT   = "Meiryo"  # 環境に無ければ游ゴシック等に自動フォールバック

EMU_W, EMU_H = Inches(13.333), Inches(7.5)

industries = [
    dict(id="歯科医院", acc=RGBColor(0x0F,0x76,0x6E), eyebrow="歯科医院向け",
         title="予約の電話が、診療の手を止めていませんか。",
         sub="ユニットが埋まる時間帯ほど電話が鳴る。受付も衛生士も、予約対応のたびに手が止まります。",
         pain=["施術中に受付が電話対応で中断し、患者さんを待たせる",
               "昼休み・診療後に予約変更やキャンセルの留守電が溜まる",
               "急患・キャンセル連絡を取りこぼし、空いた枠が埋まらない"],
         fix=["予約・変更・キャンセルをAIが24時間一次受付",
              "予約システムと自動連携（連携方式は特許）で二重予約を防止",
              "診療時間中に鳴る電話を限りなくゼロへ"],
         metrics=[("約60分/日","受付1名の電話対応を削減"),("夜間・休診日","も予約を自動獲得"),("取りこぼし0","キャンセル枠を即再販")],
         talk="衛生士さんが電話のたびに手を止める状態を、まず無くしましょう。空いたキャンセル枠も自動で埋められます。"),
    dict(id="サロン", acc=RGBColor(0xA8,0x3F,0x60), eyebrow="美容室・ネイル・エステ向け",
         title="施術中は手が離せない。その間の電話、全部取れていますか。",
         sub="カラーもネイルも、手を止められない時間に限って新規の電話が鳴ります。一人サロンなら、なおさら。",
         pain=["カット・カラー中に電話へ出られず、新規のお客様を逃す",
               "一人サロンは電話に出た瞬間、目の前の施術が止まる",
               "営業時間外の予約希望を、翌日わざわざ折り返している"],
         fix=["施術中もAIが予約対応。指名・メニュー・希望時間をヒアリング",
              "そのまま予約枠へ登録。折り返しの電話がなくなる",
              "SNS経由の夜間問い合わせも取りこぼさない"],
         metrics=[("新規予約","の取りこぼしを回収"),("折返し0件","翌日の電話がけを廃止"),("24時間","予約を受付")],
         talk="“出られなかった電話”が毎月何件あるか、一度数えてみませんか。その多くが新規のお客様です。"),
    dict(id="整体・接骨院", acc=RGBColor(0x46,0x73,0x3A), eyebrow="整体・接骨院向け",
         title="一人施術のあいだ、電話は誰が取っていますか。",
         sub="施術中は完全に電話が取れない。その一本が、そのまま競合の予約になっています。",
         pain=["施術中は電話に出られず、新患が近隣の他院へ流れる",
               "予約の電話と保険の問い合わせが混在して手間",
               "受付を雇うほどの人件費の余裕はない"],
         fix=["施術中の電話をAIが受け、症状・希望日時をヒアリングして予約化",
              "定型の問い合わせはAIが一次対応、必要なものだけ折り返し",
              "受付人件費をかけずに機会損失を止める"],
         metrics=[("取りこぼし0","施術中の新患を予約化"),("採用コスト0","受付を雇わず一次受付"),("月々の負担","受付1名の給与より軽い")],
         talk="受付を一人雇う代わりに、AIに一次受付をさせるイメージです。人件費より安く、24時間動きます。"),
    dict(id="飲食", acc=RGBColor(0xB2,0x59,0x1E), eyebrow="飲食店向け",
         title="仕込みとピーク中に鳴る予約電話、取り切れていますか。",
         sub="忙しい時間ほど電話が鳴る——その矛盾が、接客の中断と予約の取りこぼしを生みます。",
         pain=["ピーク帯の予約電話で、接客や調理の手が止まる",
               "宴会・コース予約の人数やアレルギーの聞き取りに時間がかかる",
               "営業時間外・仕込み中の予約を取りこぼす"],
         fix=["予約・人数・コース・アレルギーをAIが正確に受付",
              "ピーク中の電話対応による中断をゼロに",
              "深夜・定休日も予約を獲得。無断キャンセルの前確認も自動"],
         metrics=[("ホール","の電話対応時間を削減"),("予約回収","取りこぼしを取り戻す"),("24時間","定休日も予約受付")],
         talk="忙しい時間ほど電話が鳴る。その矛盾をAIで解きます。宴会予約の聞き漏らしも無くせます。"),
    dict(id="葬儀", acc=RGBColor(0x3C,0x4A,0x63), eyebrow="葬儀社向け",
         title="深夜の一報を、待たせず・慌てさせず受けられていますか。",
         sub="最初の一本に必ず出られる体制は信頼の要。ただ、24時間の当番は現場の大きな負担です。",
         pain=["24時間365日の一次対応が、当番・人件費として重くのしかかる",
               "深夜の一報に出遅れると、ご遺族は次の葬儀社へ連絡してしまう",
               "ご遺族の不安な問い合わせに、一貫した一次対応が求められる"],
         fix=["AIが24時間の一次受付を担い、担当者へ即エスカレーション",
              "費用・流れ・対応エリアの定型案内を落ち着いた口調で",
              "当番の待機負担を軽減しつつ、取りこぼしをゼロに"],
         metrics=[("24時間","一次対応の取りこぼし0"),("当番負担減","深夜待機の人件費を軽減"),("即引継ぎ","担当へ確実にエスカレーション")],
         talk="“最初の電話”に必ず出られる体制を、人を増やさず作れます。AIは一次受付に徹し、大切な対応はすぐ担当へ繋ぎます。",
         note="※ご遺族対応の性質上、AIは「一次受付＋即時エスカレーション」に限定し、実対応は担当者が行う設計を推奨します。"),
]

prs = Presentation()
prs.slide_width, prs.slide_height = EMU_W, EMU_H
BLANK = prs.slide_layouts[6]

def bg(slide, color):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = color

def rect(slide, x, y, w, h, fill=None, line=None, line_w=1.0, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.06):
    sp = slide.shapes.add_shape(shape, x, y, w, h)
    if fill is None:
        sp.fill.background()
    else:
        sp.fill.solid(); sp.fill.fore_color.rgb = fill
    if line is None:
        sp.line.fill.background()
    else:
        sp.line.color.rgb = line; sp.line.width = Pt(line_w)
    sp.shadow.inherit = False
    if shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        try:
            sp.adjustments[0] = radius
        except Exception:
            pass
    return sp

def txt(slide, x, y, w, h, runs, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, space_after=4, line_spacing=1.05, wrap=True):
    """runs: list of paragraphs; each paragraph = list of (text, size, color, bold)."""
    tb = slide.shapes.add_textbox(x, y, w, h); tf = tb.text_frame
    tf.word_wrap = wrap
    tf.vertical_anchor = anchor
    for m in (tf.margin_left, ):
        pass
    tf.margin_left = tf.margin_right = Pt(0); tf.margin_top = tf.margin_bottom = Pt(0)
    for i, para in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.space_after = Pt(space_after); p.space_before = Pt(0)
        p.line_spacing = line_spacing
        for (t, sz, col, bold) in para:
            r = p.add_run(); r.text = t
            r.font.size = Pt(sz); r.font.color.rgb = col; r.font.bold = bold
            r.font.name = FONT
    return tb

def bar(slide, x, y, h, color, w=Pt(7)):
    rect(slide, x, y, w, h, fill=color, shape=MSO_SHAPE.RECTANGLE)

# ============ Slide 1: 表紙 ============
s = prs.slides.add_slide(BLANK); bg(s, PAPER)
bar(s, Inches(0.9), Inches(2.35), Inches(2.4), BRAND, w=Pt(7))
txt(s, Inches(1.1), Inches(2.1), Inches(11), Inches(0.5),
    [[("業界別 提案資料", 15, BRAND, True)]])
txt(s, Inches(1.1), Inches(2.55), Inches(11.3), Inches(2.0),
    [[("「出られなかった電話」を、", 44, INK, True)],
     [("助成金で無くす。", 44, INK, True)]], line_spacing=1.08, space_after=2)
txt(s, Inches(1.1), Inches(4.7), Inches(10.8), Inches(1.4),
    [[("オタスケAI Smart Call（AI電話受付）は、働き方改革推進支援助成金の対象になり得ます。", 15, MUTED, False)],
     [("導入費用の目安180万円に対し、要件を満たせば助成の目安は約140万円。実質負担 約40万円。", 15, MUTED, False)]],
    line_spacing=1.2)
txt(s, Inches(1.1), Inches(6.6), Inches(11), Inches(0.4),
    [[("歯科医院 ／ サロン ／ 整体・接骨院 ／ 飲食 ／ 葬儀", 13, BRAND, True)]])

# ============ Slide 2: 資金スキーム ============
s = prs.slides.add_slide(BLANK); bg(s, PAPER)
bar(s, Inches(0.9), Inches(0.62), Inches(0.55), BRAND, w=Pt(9))
txt(s, Inches(1.15), Inches(0.5), Inches(11), Inches(0.7),
    [[("資金スキーム（5業種共通）", 26, INK, True)]])
txt(s, Inches(1.15), Inches(1.25), Inches(11.2), Inches(0.6),
    [[("使う制度：働き方改革推進支援助成金〔労働時間短縮・年休促進支援コース〕。", 14, MUTED, False)],
     [("電話対応のAI化を「労働時間短縮の取組」と位置づけ、設備導入費を助成対象にします。", 14, MUTED, False)]],
    line_spacing=1.2)

# フロー4ボックス + 演算子
flow = [("導入費用（目安）", "180万円", INK, CARD, LINE),
        ("補助率", "3/4", INK, CARD, LINE),
        ("助成金（目安）", "約140万円", GOOD, CARD, GOOD),
        ("実質負担（目安）", "約40万円", BRAND, CARD, BRAND)]
ops = ["×", "＝", "→"]
bx, by, bw, bh, gap = Inches(1.15), Inches(2.25), Inches(2.55), Inches(1.35), Inches(0.42)
for i, (k, v, vcol, fill, ln) in enumerate(flow):
    x = bx + i * (bw + gap)
    rect(s, x, by, bw, bh, fill=fill, line=ln, line_w=1.5)
    txt(s, x, by+Inches(0.18), bw, Inches(0.35),
        [[(k, 11, MUTED, False)]], align=PP_ALIGN.CENTER)
    txt(s, x, by+Inches(0.5), bw, Inches(0.7),
        [[(v, 26, vcol, True)]], align=PP_ALIGN.CENTER)
    if i < 3:
        txt(s, x+bw, by, gap, bh, [[(ops[i], 20, MUTED, True)]],
            align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# 仕組み3点
mech = [
    ("補助率は3/4。", "従業員30人以下で一定要件を満たすと4/5になる場合があります。"),
    ("賃上げ加算がカギ。", "対象労働者1名を7%以上賃上げする成果目標を加えると上限額が加算（従業員10人未満は2.5倍、10〜30人は2倍）。180万円の3/4＝135万円が上限内に収まります。"),
    ("賃上げ対象者は雇用保険の被保険者であること。", ""),
]
my = Inches(4.05)
for head, body in mech:
    txt(s, Inches(1.25), my, Inches(11.0), Inches(0.55),
        [[("● ", 12, BRAND, True), (head, 13.5, INK, True), (body, 13.5, INK, False)]],
        line_spacing=1.12)
    my += Inches(0.62 if not body or len(body) < 40 else 0.86)

# 要確認バンド
wy = Inches(6.2)
rect(s, Inches(1.15), wy, Inches(11.05), Inches(1.0), fill=WARN_BG, line=RGBColor(0xD3,0xBD,0x80), line_w=1.0)
txt(s, Inches(1.4), wy+Inches(0.12), Inches(10.6), Inches(0.8),
    [[("⚠ 金額はすべて概算の目安です。必ず最新の公募要領で要件・金額・受付期間を確認してください。", 12.5, WARN_IN, True)],
     [("導入・賃上げは交付決定“後”に実施（事前着手・事後申請は対象外）。賃上げは就業規則等で実際に実施が必要。事業場規模でコース・加算率・上限が変わります。受給を保証するものではありません。", 12, WARN_IN, False)]],
    line_spacing=1.15)

# ============ Slides 3-7: 業界別 ============
for d in industries:
    s = prs.slides.add_slide(BLANK); bg(s, PAPER)
    acc = d["acc"]
    # 上部アクセントバー
    rect(s, 0, 0, EMU_W, Inches(0.12), fill=acc, shape=MSO_SHAPE.RECTANGLE)
    # ヘッダー
    txt(s, Inches(0.9), Inches(0.4), Inches(11), Inches(0.35),
        [[(d["eyebrow"], 13, acc, True)]])
    txt(s, Inches(0.9), Inches(0.75), Inches(11.6), Inches(0.8),
        [[(d["title"], 27, INK, True)]], line_spacing=1.0)
    txt(s, Inches(0.9), Inches(1.62), Inches(11.6), Inches(0.5),
        [[(d["sub"], 13, MUTED, False)]], line_spacing=1.15)

    # 2カラム: 困りごと / 変えること
    col_y, col_w, col_h = Inches(2.35), Inches(5.75), Inches(2.1)
    # 左カラム
    txt(s, Inches(0.9), col_y, col_w, Inches(0.35),
        [[("現場の困りごと", 12.5, MUTED, True)]])
    rect(s, Inches(0.9), col_y+Inches(0.36), col_w, Pt(1.2), fill=LINE, shape=MSO_SHAPE.RECTANGLE)
    yy = col_y + Inches(0.5)
    for t in d["pain"]:
        txt(s, Inches(0.9), yy, col_w, Inches(0.6),
            [[("！ ", 12, PAIN, True), (t, 13.5, INK, False)]], line_spacing=1.1)
        yy += Inches(0.62)
    # 右カラム
    rx = Inches(6.95)
    txt(s, rx, col_y, col_w, Inches(0.35),
        [[("Smart Call が変えること", 12.5, MUTED, True)]])
    rect(s, rx, col_y+Inches(0.36), col_w, Pt(1.2), fill=LINE, shape=MSO_SHAPE.RECTANGLE)
    yy = col_y + Inches(0.5)
    for t in d["fix"]:
        txt(s, rx, yy, col_w, Inches(0.6),
            [[("✓ ", 12, acc, True), (t, 13.5, INK, False)]], line_spacing=1.1)
        yy += Inches(0.62)

    # メトリクス3枚
    mx, my2, mw, mh = Inches(0.9), Inches(4.7), Inches(3.75), Inches(0.95)
    mgap = Inches(0.19)
    for i, (v, k) in enumerate(d["metrics"]):
        x = mx + i * (mw + mgap)
        rect(s, x, my2, mw, mh, fill=FIELD, line=LINE, line_w=1.0)
        txt(s, x+Inches(0.2), my2+Inches(0.13), mw-Inches(0.4), Inches(0.45),
            [[(v, 19, acc, True)]])
        txt(s, x+Inches(0.2), my2+Inches(0.55), mw-Inches(0.4), Inches(0.35),
            [[(k, 11, MUTED, False)]])

    # 資金計画ミニ表
    fy = Inches(5.85)
    rect(s, Inches(0.9), fy, Inches(11.55), Inches(0.82), fill=CARD, line=acc, line_w=1.25)
    money = [("導入費用（目安）","180万円",INK),("助成金（目安）","約140万円",acc),
             ("実質負担（目安）","約40万円",acc),("賃上げ要件","対象1名 7%〜",INK)]
    cw = Inches(11.55)/4
    for i, (k, v, vcol) in enumerate(money):
        x = Inches(0.9) + cw*i
        txt(s, x+Inches(0.25), fy+Inches(0.1), cw-Inches(0.3), Inches(0.3),
            [[(k, 11, MUTED, False)]])
        txt(s, x+Inches(0.25), fy+Inches(0.36), cw-Inches(0.3), Inches(0.4),
            [[(v, 17, vcol, True)]])

    # 商談での一言
    note = d.get("note")
    ty = Inches(6.72) if note else Inches(6.82)
    bar(s, Inches(0.9), ty, Inches(0.42), acc, w=Pt(5))
    txt(s, Inches(1.08), ty-Inches(0.02), Inches(11.35), Inches(0.5),
        [[("商談での一言　", 10.5, acc, True), ("「"+d["talk"]+"」", 12.5, INK, True)]],
        line_spacing=1.02)
    if note:
        txt(s, Inches(0.9), Inches(7.18), Inches(11.6), Inches(0.28),
            [[(note, 10, MUTED, False)]])

out = "/home/user/app/tools/オタスケAI_SmartCall_業界別提案資料.pptx"
prs.save(out)
print("saved:", out, "slides:", len(prs.slides._sldIdLst))
