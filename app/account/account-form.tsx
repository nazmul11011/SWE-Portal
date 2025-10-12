"use client"

import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { updateAccount } from "./actions"
import { toast } from "sonner"

const formSchema = z.object({
    regNo: z.string().optional(),
    email: z.string().optional(),
    fullName: z.string().min(2),
    nickName: z.string().optional(),
    gender: z.string().optional(),
    phoneNumber: z.string().optional(),
    session: z.string().optional(),
    linkedinId: z.string().optional(),
    githubId: z.string().optional(),
    codeforcesId: z.string().optional(),
    whatsapp: z.string().optional(),
    facebook: z.string().optional(),
    bloodGroup: z.string().optional(),
    school: z.string().optional(),
    college: z.string().optional(),
    hometown: z.string().optional(),
    bio: z.string().optional(),
})

export default function AccountForm({
    user,
    skillList,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any
    skillList: { id: string; name: string }[]
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState(user.profilePic || "")
    const [selectedSkills, setSelectedSkills] = useState<string[]>(user.skills || [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            regNo: user.regNo || "",
            email: user.email || "",
            fullName: user.fullName || "",
            nickName: user.nickName || "",
            session: user.session || "",
            gender: user.gender || "",
            phoneNumber: user.phoneNumber || "",
            linkedinId: user.linkedinId || "",
            githubId: user.githubId || "",
            codeforcesId: user.codeforcesId || "",
            whatsapp: user.whatsapp || "",
            facebook: user.facebook || "",
            bloodGroup: user.bloodGroup || "",
            school: user.school || "",
            college: user.college || "",
            hometown: user.hometown || "",
            bio: user.bio || "",
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (!selected) return
        setFile(selected)
        setImagePreview(URL.createObjectURL(selected))
    }

    const handleSkillToggle = (skillId: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
        )
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)
        try {
            await updateAccount({ userId: user.id, ...values, skills: selectedSkills }, file || undefined)
            toast.success("Profile updated successfully")
            router.refresh()
        } catch (err) {
            console.error(err)
            toast.error("Update failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full gap-2 items-center" >
            <div className="col-span-3 grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
                    <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col items-center gap-2 order-first md:order-last">
                        <Label>Profile Picture</Label>
                        {imagePreview && (
                            <div className="relative w-36 h-36">
                                <Image src={imagePreview} alt="Profile Picture" fill className="object-cover" />
                            </div>
                        )}
                        <Input type="file" onChange={handleFileChange} />
                    </div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <div>
                                <Label className="mb-2">Full Name</Label>
                                <Input {...form.register("fullName")} disabled />
                            </div>
                            <div>
                                <Label className="my-2">Nick Name</Label>
                                <Input {...form.register("nickName")} />
                            </div>
                            <div>
                                <Label className="my-2">Session</Label>
                                <Input {...form.register("session")} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <div>
                                <Label className="mb-2">Registration No.</Label>
                                <Input {...form.register("regNo")} disabled />
                            </div>
                            <div>
                                <Label className="my-2">Email</Label>
                                <Input {...form.register("email")} disabled />
                            </div>
                            <div>
                                <Label className="my-2">Gender</Label>
                                <Controller
                                    name="gender"
                                    control={form.control}
                                    defaultValue="Male"
                                    render={({ field }) => (
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex flex-row space-x-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Male" id="male" />
                                                <Label htmlFor="male">Male</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Female" id="female" />
                                                <Label htmlFor="female">Female</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                        <Label className="mb-2">Phone</Label>
                        <Input {...form.register("phoneNumber")} />
                    </div>
                    <div>
                        <Label className="mb-2">WhatsApp</Label>
                        <Input {...form.register("whatsapp")} />
                    </div>
                    <div>
                        <Label className="mb-2">Blood Group</Label>
                        <Input {...form.register("bloodGroup")} />
                    </div>
                    <div className="col-span-3">
                        <Label className="mb-2">Bio</Label>
                        <Textarea {...form.register("bio")} />
                    </div>
                    <div>
                        <Label className="mb-2">School</Label>
                        <Input {...form.register("school")} />
                    </div>
                    <div>
                        <Label className="mb-2">College</Label>
                        <Input {...form.register("college")} />
                    </div>
                    <div>
                        <Label className="mb-2">Hometown</Label>
                        <Input {...form.register("hometown")} />
                    </div>
                    <div>
                        <Label className="mb-2">LinkedIn</Label>
                        <Input {...form.register("linkedinId")} />
                    </div>
                    <div>
                        <Label className="mb-2">GitHub</Label>
                        <Input {...form.register("githubId")} />
                    </div>
                    <div>
                        <Label className="mb-2">Codeforces</Label>
                        <Input {...form.register("codeforcesId")} />
                    </div>
                    <div>
                        <Label className="mb-2">Facebook</Label>
                        <Input {...form.register("facebook")} />
                    </div>

                    <div className="col-span-3">
                        <Label className="my-2">Skills</Label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {skillList.map((skill) => (
                                <div key={skill.id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={skill.id}
                                        checked={selectedSkills.includes(skill.id)}
                                        onChange={() => handleSkillToggle(skill.id)}
                                        className="w-4 h-4 accent-blue-500"
                                    />
                                    <label className="mb-1" htmlFor={skill.id}>{skill.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-3">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}