'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Save, Loader2 } from 'lucide-react'

interface SaveAnalysisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (title: string, memo?: string) => Promise<void>
}

export function SaveAnalysisDialog({ open, onOpenChange, onSave }: SaveAnalysisDialogProps) {
  const [title, setTitle] = useState('')
  const [memo, setMemo] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    setIsSaving(true)
    try {
      await onSave(title.trim(), memo.trim() || undefined)
      setTitle('')
      setMemo('')
      onOpenChange(false)
    } catch (error) {
      console.error('저장 오류:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>분석 결과 저장</DialogTitle>
          <DialogDescription>
            분석 결과를 저장하면 언제든지 다시 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              placeholder="예: 2024년 3월 모의고사"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memo">메모 (선택사항)</Label>
            <Textarea
              id="memo"
              placeholder="추가로 기록할 내용이 있다면 입력하세요"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              disabled={isSaving}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                저장
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

