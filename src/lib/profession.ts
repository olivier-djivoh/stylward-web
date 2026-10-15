export type Profession = 'stylist' | 'tailor' | 'couturier' | 'creator'
export type Gender = 'neutral' | 'male' | 'female'

const map: Record<Profession, Record<Gender, string>> = {
  stylist:   { neutral: 'Styliste',  male: 'Styliste',  female: 'Styliste' },
  tailor:    { neutral: 'Tailleur',  male: 'Tailleur',  female: 'Tailleuse' },
  couturier: { neutral: 'Couturier', male: 'Couturier', female: 'Couturière' },
  creator:   { neutral: 'Créateur',  male: 'Créateur',  female: 'Créatrice' },
}

export function professionLabel(
  profession?: string | null,
  gender?: string | null
): string {
  if (!profession) return 'Artisan'
  const p = profession as Profession
  const g = (gender || 'neutral') as Gender
  return map[p]?.[g] ?? 'Artisan'
}

export function professionOptions() {
  return [
    { value: 'stylist',   label: 'Styliste' },
    { value: 'tailor',    label: 'Tailleur' },
    { value: 'couturier', label: 'Couturier' },
    { value: 'creator',   label: 'Créateur de mode' },
  ]
}