import React, { useEffect } from 'react'
import { Flower2 } from 'lucide-react'

export function WeddingVowsModule() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
    const scroller = document.scrollingElement || document.documentElement
    scroller.scrollTop = 0
    scroller.scrollLeft = 0
    document.body.scrollTop = 0
    document.getElementById('root')?.scrollTo({ top: 0, left: 0 })
  }, [])

  const rumiVow = `My love, my everything,

From the moment you came into my life, everything changed. You made me a better man—more patient, more faithful, more alive. Without you, I wouldn’t be the man I am today. You are the most beautiful woman—the most beautiful person—I have ever known; loyal, loving, caring, and deeply affectionate. You are my angel, my best friend, my greatest blessing from God.

I promise to be the best husband I can possibly be—and to keep becoming an even better one, every day of my life.
I will love you with all my heart, mind, body, and soul. I will provide for our home with diligence and integrity, protect you and keep you safe—physically, emotionally, and spiritually—and put you first in every decision.

I vow to be faithful to you in body, mind, and spirit; to guard your heart as my own; to be honest and transparent, with no secrets; to communicate with kindness, listen before I speak, and make repairs quickly when we stumble. I will respect your agency, honor your dreams, and cheer for you like you’re the only one on the field—because to me, you are.

We will do life together—always: pray together, laugh together, cry together, and grow together. We will go to church together, worship God together, keep the Lord at the center of our marriage, and keep growing in our faith. We will pray as a couple, study the scriptures, repent and forgive often, and seek the Spirit’s guidance in our home. I promise to honor our covenants and to love you for time and all eternity.

Side by side, we will build a home of peace and joy. I promise to raise our future children with you in the word of God—to teach them faith, to lead by example, to read with them, pray with them, and show them what real love, sacrifice, and devotion look like by the way I love and serve you.

I vow to share the big things and the small: the bills and the budget, the dishes and the diapers, the plans and the dreams, the late-night talks and the early-morning starts. I promise date nights and deep talks, inside jokes and new adventures, celebration in our victories and comfort in our losses. I will protect your name and your reputation, defend you when you’re not in the room, and speak life over you always.

If ever sacrifice is asked of me, I will give it. If ever danger comes near, I will shield you. I would die for you, take a bullet for you, and walk through fire for you—because you are my world, my life, my forever.

Through sickness and health, scarcity and abundance, storms and sunrises, I will choose you—again and again—every single day. I will keep my promises when it’s easy and when it’s hard. I will be your rock, your safe place, your home.

Today, before God and our families, I give you all of me—my hand, my heart, my soul, my loyalty, and my eternity. You are my home, my destiny, my eternal companion.

I love you so much, forever, baby—now, always, and into eternity, sealed in faith and love.`

  return (
    <div className="max-w-3xl mx-auto bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 p-8 rounded-2xl shadow-lg border border-rose-200 text-gray-800 font-serif space-y-12">
      <div className="text-center space-y-2">
        <Flower2 className="w-10 h-10 mx-auto text-rose-400" />
        <h1 className="text-4xl font-bold text-rose-700">Our Wedding Vows</h1>
        <p className="text-rose-600">Rumi Zen Zappalorti & Khen Shantel Zappalorti</p>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl text-rose-700 font-semibold">Rumi's Vow</h2>
        <p className="whitespace-pre-line leading-relaxed">{rumiVow}</p>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl text-rose-700 font-semibold">Khen's Vow</h2>
        <p className="italic text-rose-600">To be revealed on our wedding day…</p>
      </div>
    </div>
  )
}

export default WeddingVowsModule
