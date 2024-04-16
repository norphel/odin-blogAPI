export default function getInitials(displayName) {
  let initials = "";
  for (const name of displayName.split(" ")) {
    initials += name.charAt(0);
  }
  return initials.slice(0, 2);
}
