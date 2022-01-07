def toSafeName(name):
  """Creates irc safe username.
    Must:
      - Be lowered.
      - All spaces replaced with _.
  """
  return name.lower().replace(" ", "_")
