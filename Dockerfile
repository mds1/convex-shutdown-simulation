# Building this image will include the running of all benchmarks in a "cold
# cache" state, and thus will take quite a bit of time (roughly 30-60 minutes,
# with Ganache excluded).  The cache will be retained in the built image, such
# that running the image will execute benchmarks with a "warm cache". For
# example:
#
#   docker build --build-arg ETH_RPC_URL=... -t sim .
#   docker run sim benchmark-hardhat
#
# To benchmark with a cleared cache, and without having to rebuild the entire
# tool environment, use something like:
#
#   docker run --entrypoint /bin/bash sim -c "rm -rf cache && make benchmark-hardhat"
#
# BEWARE: This image should not be published because it will contain traces of
# your RPC url, which likely contains your private API key secret. (See
# https://stackoverflow.com/a/40762010/406289 .) Future work can take advantage
# of Docker's support for secrets, but unless/until there's a need to publish
# this image, that would be overkill.

FROM debian

ARG ETH_RPC_URL

RUN if [ -z "${ETH_RPC_URL}" ]; then \
      echo build argument ETH_RPC_URL required; \
      exit 1; \
    fi && \
    apt-get update && \
    apt-get install --yes curl git make xz-utils yarnpkg && \
    ln -s /usr/bin/yarnpkg /usr/bin/yarn

# nix/dapptools don't like to install/run as root
RUN useradd user && \
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

RUN git clone https://github.com/mds1/convex-shutdown-simulation.git
WORKDIR convex-shutdown-simulation

RUN yarn && \
    cp .env.example .env && \
    sed -i "s!ETH_RPC_URL=.*!ETH_RPC_URL=${ETH_RPC_URL}!" .env && \
    curl -L https://raw.githubusercontent.com/gakonst/foundry/master/foundryup/install | bash
# Don't combine these sequential RUN commands because we need fresh shell
# instances in order for each install script to take effect.
RUN foundryup && \
    curl -L https://nixos.org/nix/install | bash
RUN curl -L https://dapp.tools/install | bash
RUN dapp update

# TODO: Benchmark ganache too, once it's fixed.
# (See https://github.com/mds1/convex-shutdown-simulation/pull/4)
RUN make benchmark-foundry && \
    make benchmark-hardhat && \
    make benchmark-dapptools

ENTRYPOINT ["make"]
