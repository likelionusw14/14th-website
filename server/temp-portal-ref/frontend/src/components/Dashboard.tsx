import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// 과목분류 코드 매핑
const CATEGORY_NAMES: Record<string, string> = {
  facDv11: "공통교양",
  facDv13: "중핵교양",
  facDv14: "전공교양",
  facDv15: "기초교양",
  facDv17: "선택교양",
  facDv19: "소양교양",
  facDv22: "전공선택",
  facDv25: "전공취업",
  facDv26: "전공필수",
}

interface DashboardProps {
  data: any
  onLogout: () => void
}

export function Dashboard({ data, onLogout }: DashboardProps) {
  const personal = data.personal?.studentInfo || {}
  const credits = data.credits_summary || {}
  const semesterList = credits.listSmrCretSumTabYearSmr || []
  const categoryData = credits.listSmrCretSumTabFac || []

  // 과목분류별 학점 추출
  const creditsByCategory = categoryData.find((item: any) => item.gb === "취득학점") || {}

  const totalCredits = credits.selectSmrCretSumTabSjTotal?.gainPoint || 0
  const totalGPA = credits.selectSmrCretSumTabSjTotal?.gainAvmk || "-"

  // 과목분류별 학점 리스트 생성
  const categoryCredits = Object.entries(CATEGORY_NAMES)
    .map(([key, name]) => ({
      name,
      credits: creditsByCategory[key] || 0,
    }))
    .filter((item) => item.credits > 0)
    .sort((a, b) => b.credits - a.credits)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">성적 조회</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{personal.studNm}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* 기본 정보 */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-slate-400">학번: </span>
                <span className="text-white">{personal.sno}</span>
              </div>
              <div>
                <span className="text-slate-400">학과: </span>
                <span className="text-white">{personal.dpmjNm}</span>
              </div>
              <div>
                <span className="text-slate-400">학년: </span>
                <span className="text-white">{personal.studGrde}학년</span>
              </div>
              <div>
                <span className="text-slate-400">상태: </span>
                <span className="text-white">{personal.scrgStatNm}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 총 학점/평점 */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="pt-4 text-center">
              <p className="text-slate-400 text-sm">총 취득학점</p>
              <p className="text-3xl font-bold text-white mt-1">{totalCredits}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="pt-4 text-center">
              <p className="text-slate-400 text-sm">전체 평점</p>
              <p className="text-3xl font-bold text-white mt-1">{totalGPA}</p>
            </CardContent>
          </Card>
        </div>

        {/* 과목분류별 학점 */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">이수구분별 학점</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categoryCredits.map((cat) => (
                <div
                  key={cat.name}
                  className="flex justify-between items-center p-2 rounded-lg bg-white/5"
                >
                  <span className="text-sm text-slate-300">{cat.name}</span>
                  <span className="text-sm font-medium text-white">{cat.credits}학점</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 탭: 학기별 성적 */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger
              value="summary"
              className="text-slate-400 data-[selected]:bg-violet-600 data-[selected]:text-white"
            >
              학기별 요약
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="text-slate-400 data-[selected]:bg-violet-600 data-[selected]:text-white"
            >
              상세 성적
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-4 space-y-2">
            {semesterList.map((sem: any, idx: number) => (
              <Card key={idx} className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{sem.cretGainYearSmr}</p>
                    <p className="text-sm text-slate-400">
                      {sem.gainPoint}학점 취득 · 석차 {sem.dpmjOrdp || "-"}
                    </p>
                  </div>
                  <Badge
                    className={`text-base px-3 py-1 ${
                      Number(sem.gainAvmk) >= 4.0
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : Number(sem.gainAvmk) >= 3.0
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                    }`}
                  >
                    {sem.gainAvmk}
                  </Badge>
                </CardContent>
              </Card>
            ))}
            {semesterList.length === 0 && (
              <p className="text-center text-slate-500 py-8">학기 데이터가 없습니다.</p>
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-4">
            {semesterList.map((sem: any, idx: number) => (
              <Card key={idx} className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
                <CardHeader className="py-3 bg-white/5 border-b border-white/10">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base text-white">{sem.cretGainYearSmr}</CardTitle>
                    <span className="text-sm text-slate-400">평점 {sem.gainAvmk}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {sem.details?.listSmrCretSumTabSubjt ? (
                    <div className="divide-y divide-white/5">
                      {sem.details.listSmrCretSumTabSubjt.map((subj: any, sIdx: number) => (
                        <div key={sIdx} className="px-4 py-2 flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">{subj.subjtNm}</p>
                            <p className="text-xs text-slate-500">
                              {subj.facDvnm} · {subj.gainPoint}학점
                            </p>
                          </div>
                          <span className="text-violet-400 font-medium">
                            {subj.cretGrdCd || subj.getGrde}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-6 text-sm">
                      상세 정보가 없습니다.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
            {semesterList.length === 0 && (
              <p className="text-center text-slate-500 py-8">데이터가 없습니다.</p>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
