# Building this image will include the running of all benchmarks in a "cold
# cache" state, and thus will take quite a bit of time (roughly 30-60 minutes,
# with Ganache excluded).  The cache will be retained in the built image, such
# that running the image will execute benchmarks with a "warm cache". For
# example:
#
#   docker build -t sim .
#   docker run -t sim benchmark-hardhat
#
# To benchmark with a cleared cache, and without having to rebuild the entire
# tool environment, use something like:
#
#   docker run --entrypoint /bin/bash -t sim -c "rm -rf cache && make benchmark-hardhat"
#
# You can also copy the cache from the built container to your docker host, so
# that it will be incorporated into a subsequent build of the image, allowing a
# "warm cache" run in a freshly built image. To do this, use something like:
#
#   id=$(docker create sim)
#   docker cp $id:/home/user/convex-shutdown-simulation/cache .
#   docker rm -v $id
#   # source: https://stackoverflow.com/a/31316636/406289
#
# BEWARE: This image should not be published because it will contain traces of
# your RPC url, which likely contains your private API key secret. (See
# https://stackoverflow.com/a/40762010/406289 .) Future work can take advantage
# of Docker's support for secrets, but unless/until there's a need to publish
# this image, that would be overkill.
#
# Lines in this file starting with "#   " are assumed to be example usage
# commands and are verified by ./testDockerfile.sh

FROM debian

RUN apt-get update && \
    apt-get install --yes curl git make xz-utils yarnpkg && \
    ln -s /usr/bin/yarnpkg /usr/bin/yarn

# nix/dapptools don't like to install/run as root
RUN groupadd user && \
    useradd -g user user && \
    mkdir -p -m 0755 /home/user && \
    chown user /home/user && \
    mkdir -m 0755 /nix && \
    chown user /nix
WORKDIR /home/user
USER user
# nix/dapptools install scripts require this environment:
ENV USER=user
ENV BASH_ENV=/home/user/.profile
ENV SHELL=/bin/bash
SHELL ["/bin/bash", "-c"]

WORKDIR convex-shutdown-simulation
USER root
RUN chown -R user:user /home/user
USER user
COPY --chown=user:user package.json .
COPY --chown=user:user yarn.lock .

RUN ln -s ~/.bashrc ~/.profile
RUN yarn && \
    curl -L https://raw.githubusercontent.com/gakonst/foundry/master/foundryup/install | bash
# Don't combine these sequential RUN commands because we need fresh shell
# instances in order for each install script to take effect.
RUN foundryup && \
    curl -L https://nixos.org/nix/install | bash
RUN curl -L https://dapp.tools/install | bash
COPY --chown=user:user .git .git
RUN dapp update

COPY --chown=user:user . .

# The following lines can be reordered to optimize Image rebuild times. RUN
# stable ones first, and leave unstable ones for last, so that your rebuild can
# hit the Layer cache for the stable ones.
RUN make benchmark-foundry
RUN make benchmark-hardhat
RUN make benchmark-dapptools
# TODO: Benchmark ganache too, once it's fixed.
# (See https://github.com/mds1/convex-shutdown-simulation/pull/4)

ENTRYPOINT ["make"]
