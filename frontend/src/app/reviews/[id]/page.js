import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ReviewPage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: review } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .single()

  const { data: outputs } = await supabase
    .from('agent_outputs')
    .select('*')
    .eq('review_id', id)
    .order('completed_at')

  const agentLabels = {
    code_reader: 'Code reader',
    security_auditor: 'Security auditor',
    improvement_suggester: 'Improvement suggester',
    report_writer: 'Final report',
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">{review?.pr_title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            PR #{review?.pr_number} by {review?.pr_author} ·{' '}
            <span className="capitalize">{review?.status}</span>
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {outputs?.map(output => (
            <Card key={output.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {agentLabels[output.agent_name] ?? output.agent_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm whitespace-pre-wrap text-muted-foreground font-sans leading-relaxed">
                  {output.raw_output}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}