interface JobLogoProps {
  size?: 'sm' | 'md' | 'lg'
  light?: boolean
}

const cfg = {
  sm: { text: 'text-[15px]', dot: 'h-[3px] w-[3px]', bar: 'h-[3px]', gap: 'gap-[3px]', mt: 'mt-1' },
  md: { text: 'text-[21px]', dot: 'h-[4px] w-[4px]', bar: 'h-[4px]', gap: 'gap-[4px]', mt: 'mt-1.5' },
  lg: { text: 'text-[38px]', dot: 'h-[6px] w-[6px]', bar: 'h-[6px]', gap: 'gap-[5px]', mt: 'mt-2' },
}

export default function JobLogo({ size = 'md', light = false }: JobLogoProps) {
  const s = cfg[size]
  const text = light ? 'text-white' : 'text-foreground'
  const dot1 = light ? 'bg-white/30' : 'bg-foreground/20'
  const dot2 = light ? 'bg-white/55' : 'bg-foreground/40'
  const dot3 = light ? 'bg-white/80' : 'bg-foreground/65'
  const bar  = light ? 'bg-white'    : 'bg-primary'

  return (
    <div className="inline-flex items-end select-none leading-none">
      <div className="flex flex-col">
        <span className={`font-black ${s.text} leading-none tracking-[-0.03em] ${text}`}>job</span>
        <div className={`flex items-center ${s.gap} ${s.mt}`}>
          <div className={`rounded-full ${dot1} ${s.dot}`} />
          <div className={`rounded-full ${dot2} ${s.dot}`} />
          <div className={`rounded-full ${dot3} ${s.dot}`} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className={`font-black ${s.text} leading-none tracking-[-0.03em] ${text}`}>flow</span>
        <div className={`${s.mt} ${s.bar} w-full rounded-full ${bar}`} />
      </div>
    </div>
  )
}
