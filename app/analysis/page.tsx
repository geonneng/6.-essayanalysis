'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BarChart3, Download, Share2, FileText, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react"
import { useRouter } from "next/navigation"
// PDF 라이브러리 제거 - 브라우저 내장 인쇄 기능 사용

export default function AnalysisResults() {
  const router = useRouter()
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isKakaoReady, setIsKakaoReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [sentenceImprovements, setSentenceImprovements] = useState<any[]>([])
  const [isLoadingImprovements, setIsLoadingImprovements] = useState(false)

  useEffect(() => {
    // 세션 스토리지에서 분석 결과 가져오기
    const storedEnriched = sessionStorage.getItem('latestAnalysisResult_enriched')
    const storedResult = sessionStorage.getItem('latestAnalysisResult')
    console.log('세션 스토리지에서 읽어온 데이터:', storedResult)
    
    if (storedEnriched) {
      try {
        const parsed = JSON.parse(storedEnriched)
        setAnalysisResult(parsed)
        return
      } catch {
        // ignore and fall back to raw
      }
    }
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult)
        console.log('세션 스토리지에서 파싱된 분석 결과:', parsedResult)
        // 로딩 직후 존댓말 정규화
        const normalized = {
          ...parsedResult,
          strengths: Array.isArray(parsedResult.strengths) ? parsedResult.strengths.map((s: string) => toPolite(s)) : [],
          weaknesses: Array.isArray(parsedResult.weaknesses) ? parsedResult.weaknesses.map((s: string) => toPolite(s)) : [],
          improvements: Array.isArray(parsedResult.improvements) ? parsedResult.improvements.map((s: string) => toPolite(s)) : [],
          detailedAnalysis: parsedResult.detailedAnalysis ? {
            contentAnalysis: toPolite(parsedResult.detailedAnalysis.contentAnalysis || ''),
            structureAnalysis: toPolite(parsedResult.detailedAnalysis.structureAnalysis || ''),
            educationalPerspective: toPolite(parsedResult.detailedAnalysis.educationalPerspective || ''),
            educationalTheory: toPolite(parsedResult.detailedAnalysis.educationalTheory || ''),
          } : undefined,
        }
        setAnalysisResult(normalized)
        // 세션 스토리지에서 제거하지 않음 (페이지 새로고침 시에도 유지)
      } catch (error) {
        console.error('분석 결과 파싱 오류:', error)
        setLoadError('분석 결과를 불러오지 못했습니다. 다시 시도해 주세요.')
        alert('분석 결과를 불러오지 못했습니다. 다시 시도해 주세요.')
        router.push('/essay')
      }
    } else {
      console.log('세션 스토리지에 데이터가 없음')
      setLoadError('분석 데이터가 없습니다. 먼저 /essay에서 분석을 진행해 주세요.')
      alert('분석 데이터가 없습니다. 먼저 /essay에서 분석을 진행해 주세요.')
      router.push('/essay')
    }
  }, [])

  // enrich API 호출 제거 - 상세분석 결과가 즉시 표시되도록 함

  // 공유 설정 섹션은 제거되었습니다

  // Kakao SDK 로드 및 초기화 (있을 때만)
  useEffect(() => {
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
    if (!kakaoKey) return

    const existing = document.querySelector('script[data-kakao-sdk]')
    if (existing) return

    const script = document.createElement('script')
    script.src = 'https://developers.kakao.com/sdk/js/kakao.min.js'
    script.async = true
    script.setAttribute('data-kakao-sdk', 'true')
    script.onload = () => {
      try {
        const w = window as any
        if (w.Kakao && !w.Kakao.isInitialized()) {
          w.Kakao.init(kakaoKey)
        }
        setIsKakaoReady(true)
      } catch {
        setIsKakaoReady(false)
      }
    }
    document.body.appendChild(script)
  }, [])

  const buildShareText = (forInit?: boolean) => {
    const title = (analysisResult?.questionTitle || '교직논술 분석 결과')
    const score = `${analysisResult?.score ?? 0}/${analysisResult?.maxScore ?? 20}`
    const strengths = (analysisResult?.strengths || []).slice(0, 2).join(' · ')
    const weaknesses = (analysisResult?.weaknesses || []).slice(0, 2).join(' · ')
    const base = `${title}\n점수: ${score}\n강점: ${strengths || '—'}\n보완점: ${weaknesses || '—'}`
    return base
  }

  const handleShare = async () => {
    try {
      const shareData = {
        title: '교직논술 분석 결과',
        text: buildShareText(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      }
      if (navigator.share) {
        await navigator.share(shareData as any)
        return
      }
    } catch {
      // Web Share 실패 시 계속 폴백
    }

    try {
      const w = window as any
      if (isKakaoReady && w.Kakao?.Share) {
        w.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '교직논술 분석 결과',
            description: buildShareText(),
            imageUrl: 'https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
          buttons: [
            {
              title: '결과 보기',
              link: {
                mobileWebUrl: window.location.href,
                webUrl: window.location.href,
              },
            },
          ],
        })
        return
      }
    } catch {
      // Kakao 실패 시 계속 폴백
    }

    try {
      await navigator.clipboard.writeText(`${buildShareText()}\n${window.location.href}`)
      alert('링크가 클립보드에 복사되었습니다.')
    } catch {
      alert('공유 기능을 사용할 수 없습니다. 링크를 직접 복사해 주세요.')
    }
  }

  // --- Polite normalization & enrichment helpers ---
  const ensurePoliteEnding = (sentence: string) => {
    const s = sentence.trim()
    if (!s) return s
    // 세미콜론/콜론/쉼표로 끝나면 마침표 추가
    const withPeriod = /[\.\?\!]$/.test(s) ? s : s + '.'
    // 흔한 서술어 변환
    return withPeriod
      .replace(/\b이다\b/g, '입니다')
      .replace(/\b한다\b/g, '합니다')
      .replace(/\b하였다\b|\b했다\b/g, '했습니다')
      .replace(/\b아니다\b/g, '아닙니다')
      .replace(/\b좋다\b/g, '좋습니다')
      .replace(/\b적절하다\b/g, '적절합니다')
      .replace(/\b필요하다\b/g, '필요합니다')
      .replace(/\b부족하다\b/g, '부족합니다')
      .replace(/\b문제가 있다\b/g, '문제가 있습니다')
      .replace(/\b권장한다\b/g, '권장드립니다')
  }

  const toPolite = (text: string) => {
    try {
      return text
        .split(/(?<=[\.\?\!\n])\s+/)
        .map(ensurePoliteEnding)
        .join(' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
    } catch {
      return ensurePoliteEnding(text)
    }
  }

  const generateStrengthDetails = (polite: string) => {
    const focus = polite.slice(0, 40)
    return [
      `왜 중요한가: 해당 강점은 채점 루브릭의 핵심 기준과 부합하여 가치를 높입니다. 특히 '${focus}…' 대목이 설득력을 높입니다.`,
      `증거 제시: 원문에서 핵심 문장을 인용하거나 수치·사례를 덧붙이시면 강점이 더욱 분명해집니다.`,
      `적용 확장: 유사 문제에서도 동일한 구조(주장→근거→예시→시사점)를 유지하시면 안정적으로 높은 평가를 받으실 수 있습니다.`,
      `[사례 중심] 학급 내 또래 갈등 상황에서 같은 원칙을 적용해 재발률이 감소한 경험을 2~3문장으로 요약해 주시면 설득력이 높아집니다.`,
      `[통계 중심] 학교폭력 실태조사(예: 교육부, 2024) 수치를 1개 인용하여 주장과 연결해 주시면 객관성이 강화됩니다.`,
      `[이론 인용] 비고츠키의 근접발달영역(ZPD)을 간단히 언급하며 지도 전략의 타당성을 뒷받침하시면 좋습니다.`,
    ]
  }

  const generateWeaknessDetails = (polite: string) => {
    const focus = polite.slice(0, 40)
    return [
      `영향도: '${focus}…'로 인해 주장-근거 간 연결성이 약화되어 독자의 이해와 신뢰가 떨어질 수 있습니다.`,
      `원인 파악: 개념 정의의 미흡, 근거의 일반성, 실행 단계 누락 중 무엇이 원인인지 확인해 보시기 바랍니다.`,
      `개선 전략: 핵심 용어를 먼저 정의하고, 사례·통계 등 검증 가능한 근거를 배치한 뒤 단계별 실행(단기·중기)을 추가하시면 좋습니다.`,
      `[사례 중심] 현장 장면 1개(관찰 기록 형태)를 제시하여 문제의 양상과 맥락을 구체화해 주시기 바랍니다.`,
      `[통계 중심] 관련 설문/출석/상담 기록 등 간단 지표를 1개 제시하여 개선 필요성을 수치로 드러내 주시면 좋습니다.`,
      `[이론 인용] 피아제의 인지발달 단계 또는 반두라의 사회학습이론을 인용해 접근 적합성을 점검해 보시기 바랍니다.`,
    ]
  }

  const generateImprovementDetails = (polite: string) => {
    return [
      `실행 계획: 1주차(현황 진단·관찰 기록) → 2주차(개입·수업 적용) → 4주차(효과 점검·보완)처럼 기간을 명시해 주시면 좋습니다.`,
      `자원 연계: 담임·상담교사·학부모·관리자 등 이해관계자를 역할별로 배치하고 협력 루트를 확보하시면 실행력이 높아집니다.`,
      `성과 지표: 참여율·행동 변화 체크리스트·피드백 설문 등 정량·정성 지표를 함께 설정해 개선 효과를 확인하시기 바랍니다.`,
      `[사례 중심] ‘갈등 중재 회의’ 절차를 실제로 적용한 짧은 사례를 2~3단계로 정리해 주시면 재현 가능성이 높아집니다.`,
      `[통계 중심] 목표치(예: 4주 내 결근/지각 30% 감소, 상담 참여율 80% 달성)를 사전에 설정해 추적하시기 바랍니다.`,
      `[이론 인용] 구성주의 관점에서 협동학습 구조(Jigsaw 등)를 간단히 언급하며 활동 설계의 이론적 근거를 제시해 주십시오.`,
    ]
  }

  // 개선/보완 항목의 맥락 연결을 위해 원문(문제/답안)에서 관련 구절을 찾는 보조 함수
  const getRelatedContext = (itemText: string, question: string, answer: string): { label: '문제' | '답안', snippet: string } | null => {
    try {
      const tokenize = (s: string) => (s.match(/[가-힣A-Za-z0-9]{2,}/g) || []).map(w => w.toLowerCase())
      const stop = new Set(['그리고','그러나','하지만','또한','및','있는','위한','한다','하였다','입니다','정도','관련','부분','개선','필요','가능','제시','예시','학생','교사','학교','학급'])
      const terms = tokenize(itemText).filter(t => !stop.has(t)).slice(0, 6)
      const splitSentences = (text: string) =>
        text
          .replace(/\r\n?/g, '\n')
          .split(/(?<=[\.\!\?]|\n|다\.|니다\.|요\.)\s+/)
          .map(s => s.trim())
          .filter(Boolean)
      const qSents = splitSentences(question)
      const aSents = splitSentences(answer)
      const score = (sent: string) => {
        const lower = sent.toLowerCase()
        return terms.reduce((acc, t) => acc + (lower.includes(t) ? 1 : 0), 0)
      }
      let best: {label: '문제'|'답안', snippet: string, sc: number} | null = null
      for (const s of qSents) {
        const sc = score(s)
        if (sc > 0 && (!best || sc > best.sc)) best = { label: '문제', snippet: s, sc }
      }
      for (const s of aSents) {
        const sc = score(s)
        if (sc > 0 && (!best || sc > best.sc)) best = { label: '답안', snippet: s, sc }
      }
      if (!best) return null
      return { label: best.label, snippet: best.snippet }
    } catch {
      return null
    }
  }

  // 답안에서만 관련 근거를 찾는 보조 함수
  const getRelatedFromAnswer = (itemText: string, answer: string): { label: '답안', snippet: string } | null => {
    try {
      const tokenize = (s: string) => (s.match(/[가-힣A-Za-z0-9]{2,}/g) || []).map(w => w.toLowerCase())
      const stop = new Set(['그리고','그러나','하지만','또한','및','있는','위한','한다','하였다','입니다','정도','관련','부분','개선','필요','가능','제시','예시','학생','교사','학교','학급'])
      const terms = tokenize(itemText).filter(t => !stop.has(t)).slice(0, 6)
      const splitSentences = (text: string) =>
        text
          .replace(/\r\n?/g, '\n')
          .split(/(?<=[\.\!\?]|\n|다\.|니다\.|요\.)\s+/)
          .map(s => s.trim())
          .filter(Boolean)
      const aSents = splitSentences(answer)
      const score = (sent: string) => {
        const lower = sent.toLowerCase()
        return terms.reduce((acc, t) => acc + (lower.includes(t) ? 1 : 0), 0)
      }
      let best: { snippet: string, sc: number } | null = null
      for (const s of aSents) {
        const sc = score(s)
        if (sc > 0 && (!best || sc > best.sc)) best = { snippet: s, sc }
      }
      if (!best) return null
      return { label: '답안', snippet: best.snippet }
    } catch {
      return null
    }
  }

  // 강점 섹션에서 (사례 중심)/(통계 중심) 레이블만 제거(본문은 보존)
  const sanitizeExampleLabels = (text: string) => {
    try {
      return text
        .replace(/\s*[\(\[\{]?\s*(사례\s*중심|통계\s*중심)\s*[\)\]\}]?\.?/gi, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/\s+\./g, '.')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    } catch {
      return text
    }
  }

  // 더 이상 기본(Mock) 데이터는 사용하지 않습니다

  // 답안을 문장 단위로 분리하는 함수
  const splitIntoSentences = (text: string) => {
    if (!text) return []
    return text
      .replace(/\r\n?/g, '\n')
      .split(/(?<=[\.\!\?])\s+/)
      .map(s => s.trim())
      .filter(Boolean)
  }

  // 문장별 개선 사항을 가져오는 함수 (캐싱 포함)
  const fetchSentenceImprovements = async () => {
    if (!analysisResult?.answerText) return
    
    // 답안 텍스트로 캐시 키 생성 (간단한 해시)
    const simpleHash = (str: string) => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      return hash.toString(36)
    }
    const cacheKey = `sentence_improvements_${simpleHash(analysisResult.answerText)}`
    
    // 캐시 확인
    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        console.log('Using cached sentence improvements (API 호출 절약)')
        const parsedCache = JSON.parse(cached)
        setSentenceImprovements(parsedCache.improvements || [])
        return
      }
    } catch (e) {
      console.log('Cache read failed, fetching fresh data')
    }
    
    setIsLoadingImprovements(true)
    try {
      console.log('Fetching sentence improvements from API...')
      const response = await fetch('/api/improve-sentences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answerText: analysisResult.answerText,
          weaknesses: analysisResult.weaknesses || [],
          improvements: analysisResult.improvements || [],
          questionText: analysisResult.questionText || ''
        })
      })
      const data = await response.json()
      console.log('Received sentence improvements:', data)
      setSentenceImprovements(data.improvements || [])
      
      // 결과를 캐시에 저장 (API 호출 절약)
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(data))
        console.log('Cached sentence improvements for future use')
      } catch (e) {
        console.log('Cache save failed, but continuing')
      }
    } catch (error) {
      console.error('문장 개선 사항 로드 실패:', error)
      setSentenceImprovements([])
    } finally {
      setIsLoadingImprovements(false)
    }
  }

  // 분석 결과가 로드되면 문장 개선 사항 가져오기
  useEffect(() => {
    if (analysisResult?.answerText && analysisResult?.weaknesses && analysisResult?.improvements) {
      fetchSentenceImprovements()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisResult])

  const handleNewAnalysis = () => {
    // 새로운 분석을 시작할 때 세션 스토리지 정리
    sessionStorage.removeItem('latestAnalysisResult')
    // 문장 개선 캐시도 모두 정리 (새 분석용)
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sentence_improvements_')) {
          sessionStorage.removeItem(key)
        }
      })
    } catch (e) {
      console.log('Cache cleanup failed, but continuing')
    }
    router.push('/essay')
  }

  const handleDownloadPDF = () => {
    if (!analysisResult) return
    
    // 브라우저의 인쇄 기능을 사용하여 PDF로 저장
    window.print()
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          {loadError && (
            <p className="text-sm text-muted-foreground">{loadError}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 인쇄용 스타일 */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-content, .printable-content * {
            visibility: visible;
          }
          .printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
          }
          .no-print {
            display: none !important;
          }
          .print-page-break {
            page-break-before: always;
          }
          .print-avoid-break {
            page-break-inside: avoid;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 no-print">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">분석 결과</h1>
              <p className="text-sm text-muted-foreground">{analysisResult.analysisDate}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              PDF 다운로드
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              공유하기
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl printable-content">
        <div className="space-y-6">
          
          {/* Question Title */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{analysisResult.questionTitle}</CardTitle>
              <CardDescription>분석 완료된 논술 문제</CardDescription>
            </CardHeader>
          </Card>

          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>종합 점수</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 bg-muted/30 rounded-lg">
                <div className="text-5xl font-bold text-primary mb-4">
                  {analysisResult.score}/{analysisResult.maxScore}
                </div>
                <Badge variant={analysisResult.score > 0 ? "secondary" : "destructive"} className="text-lg px-4 py-2">
                  {analysisResult.score > 0 ? 
                    (analysisResult.score >= 16 ? "우수한 수준" : 
                     analysisResult.score >= 12 ? "보통 수준" : "개선 필요") : 
                    "분석 데이터 없음"}
                </Badge>
                <p className="text-muted-foreground mt-2">
                  {analysisResult.score > 0 ? 
                    "전체 평균보다 높은 점수입니다" : 
                    "분석을 먼저 진행해주세요"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category Scores */}
          <Card>
            <CardHeader>
              <CardTitle>세부 평가 항목</CardTitle>
              <CardDescription>각 평가 기준별 상세 점수입니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-2">{analysisResult.categories.logicalStructure}/10</div>
                  <p className="font-medium mb-2">논리적 체계성</p>
                  <Progress value={analysisResult.categories.logicalStructure * 10} className="h-2" />
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-secondary mb-2">
                    {analysisResult.categories.spelling}/10
                  </div>
                  <p className="font-medium mb-2">맞춤법</p>
                  <Progress value={analysisResult.categories.spelling * 10} className="h-2" />
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-accent mb-2">{analysisResult.categories.vocabulary}/10</div>
                  <p className="font-medium mb-2">어휘 및 문장의 적절성</p>
                  <Progress value={analysisResult.categories.vocabulary * 10} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-1 gap-6">
            {/* Original Question and Answer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>원본 문제 및 답안</span>
                </CardTitle>
                <CardDescription>분석된 논술 문제와 작성한 답안입니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">문제</h4>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-foreground whitespace-pre-wrap">{analysisResult.questionText}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">답안</h4>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    {isLoadingImprovements ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-3 text-sm text-muted-foreground">문장별 개선 사항을 분석하고 있습니다...</span>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {splitIntoSentences(analysisResult.answerText).map((sentence, idx) => {
                          const improvement = sentenceImprovements.find(imp => imp.position === idx)
                          return (
                            <div key={idx} className="space-y-3">
                              <p 
                                className={`text-foreground leading-loose ${improvement ? 'underline decoration-purple-500 decoration-2 underline-offset-4' : ''}`}
                                style={{ lineHeight: '4' }}
                              >
                                {sentence}
                              </p>
                              {improvement && (
                                <div className="ml-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border-l-4 border-purple-500 shadow-sm">
                                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-3 flex items-start gap-2">
                                    <span className="font-semibold flex items-center gap-1">
                                      💡 개선 제안:
                                    </span>
                                    <span>{improvement.reason}</span>
                                  </p>
                                  <div className="text-sm space-y-2 bg-white dark:bg-gray-900 p-3 rounded border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-start gap-2">
                                      <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5">❌</span>
                                      <p className="text-gray-600 dark:text-gray-400 line-through flex-1">
                                        {improvement.originalSentence}
                                      </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5">✅</span>
                                      <p className="text-purple-600 dark:text-purple-400 font-medium flex-1">
                                        {improvement.improvedSentence}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-xs text-purple-600 dark:text-purple-400 italic mt-3">
                                    와 같이 고쳐도 괜찮을 것 같습니다.
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>주요 강점</span>
                </CardTitle>
                <CardDescription>답안에서 잘 작성된 부분들입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {analysisResult.strengths.map((strength: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground leading-relaxed text-sm whitespace-pre-wrap">{strength}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>보완이 필요한 부분</span>
                </CardTitle>
                <CardDescription>개선할 수 있는 영역들입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {analysisResult.weaknesses.map((weakness: string, index: number) => {
                    const ctx = getRelatedFromAnswer(weakness, analysisResult.answerText || '')
                    return (
                      <li
                        key={index}
                        className="flex items-start space-x-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800"
                      >
                        <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-foreground leading-relaxed text-sm whitespace-pre-wrap">{weakness}</p>
                          {ctx && (
                            <p className="text-xs text-orange-700 dark:text-orange-300">
                              관련 근거({ctx.label}): {ctx.snippet}
                            </p>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>구체적 개선 방안</span>
                </CardTitle>
                <CardDescription>다음 논술 작성 시 참고할 수 있는 개선 방향입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {analysisResult.improvements.map((improvement: string, index: number) => {
                    const ctx = getRelatedFromAnswer(improvement, analysisResult.answerText || '')
                    return (
                      <li
                        key={index}
                        className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-foreground leading-relaxed text-sm whitespace-pre-wrap">{improvement}</p>
                          {ctx && (
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              관련 근거({ctx.label}): {ctx.snippet}
                            </p>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            {analysisResult.detailedAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>상세 분석 결과</span>
                  </CardTitle>
                  <CardDescription>배점 기준에 따른 종합적이고 상세한 분석입니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">논술 내용 분석</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                          {toPolite(analysisResult.detailedAnalysis.contentAnalysis)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">논술 체계 분석</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                          {toPolite(analysisResult.detailedAnalysis.structureAnalysis)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">교육적 관점 평가</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                          {toPolite(analysisResult.detailedAnalysis.educationalPerspective)}
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">교육학 이론 관점 평가</h4>
                        <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                          {toPolite(analysisResult.detailedAnalysis.educationalTheory)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>점수 상세 분석</span>
                </CardTitle>
                <CardDescription>각 평가 기준별 상세 점수와 분석입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-2">{analysisResult.categories.logicalStructure}/10</div>
                      <p className="font-medium mb-2">논리적 체계성</p>
                      <Progress value={analysisResult.categories.logicalStructure * 10} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">논리적 구조와 전개 방식</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-3xl font-bold text-secondary mb-2">{analysisResult.categories.spelling}/10</div>
                      <p className="font-medium mb-2">맞춤법</p>
                      <Progress value={analysisResult.categories.spelling * 10} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">맞춤법과 띄어쓰기 정확성</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-3xl font-bold text-accent mb-2">{analysisResult.categories.vocabulary}/10</div>
                      <p className="font-medium mb-2">어휘 및 문장의 적절성</p>
                      <Progress value={analysisResult.categories.vocabulary * 10} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">어휘 선택과 문장 구성</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">종합 평가</h4>
                    <p className="text-sm text-foreground">
                      총 {analysisResult.score}점으로 {analysisResult.maxScore}점 만점 중 {Math.round((analysisResult.score / analysisResult.maxScore) * 100)}%를 획득했습니다.
                      {analysisResult.score >= 16 ? " 우수한 수준의 논술입니다." : 
                       analysisResult.score >= 12 ? " 보통 수준의 논술입니다." : 
                       " 개선이 필요한 논술입니다."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 no-print">
            <Button 
              onClick={handleNewAnalysis}
              variant="outline" 
              className="flex-1 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              새로운 분석 시작하기
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleDownloadPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              PDF로 저장하기
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
