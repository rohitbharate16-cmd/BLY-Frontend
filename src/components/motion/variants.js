export const premiumEase = [0.22, 1, 0.36, 1]

export const detailItemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: premiumEase },
  },
}
